#!/usr/bin/env python3
"""
find_orphaned_images.py - Detect and clean up orphaned images in Firebase Storage

Cross-references all image files in Firebase Storage against reviews in
Firebase Realtime Database to find images that are no longer referenced by any review.

Usage:
  python3 find_orphaned_images.py
  python3 find_orphaned_images.py --delete
  python3 find_orphaned_images.py --json
"""

import argparse
import json
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request

DEFAULT_BUCKET = "firebase-sexy-anime-reviews.appspot.com"
DEFAULT_PREFIX = "covers/"
DEFAULT_DB_URL = "https://sexy-anime-reviews.firebaseio.com/reviews.json"


def format_bytes(num_bytes):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if abs(num_bytes) < 1024.0:
            return f"{num_bytes:3.1f} {unit}"
        num_bytes /= 1024.0
    return f"{num_bytes:.1f} TB"


def fetch_database_reviews(db_url):
    """Fetches all reviews from Firebase Realtime Database and extracts referenced storage paths."""
    req = urllib.request.Request(db_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        reviews_data = json.loads(resp.read().decode('utf-8'))

    if not isinstance(reviews_data, dict):
        return {}, {}

    # Map of storage object path -> list of review titles referencing it
    referenced_paths = {}

    for review_key, review in reviews_data.items():
        if not isinstance(review, dict):
            continue
        title = review.get('title') or review_key
        cover_url = review.get('cover', '')
        thumb_url = review.get('thumbnail', '')

        for url in [cover_url, thumb_url]:
            if not url or not isinstance(url, str):
                continue
            if 'firebasestorage.googleapis.com' in url:
                parsed = urllib.parse.urlparse(url)
                if '/o/' in parsed.path:
                    raw_path = parsed.path.split('/o/', 1)[1]
                    storage_path = urllib.parse.unquote(raw_path)
                    referenced_paths.setdefault(storage_path, []).append(title)
            elif url.startswith('gs://'):
                # In case gs:// uri is stored
                parts = url.split('/', 3)
                if len(parts) >= 4:
                    referenced_paths.setdefault(parts[3], []).append(title)

    return reviews_data, referenced_paths


def list_bucket_objects(bucket, prefix):
    """Lists objects in Firebase Storage bucket using gcloud storage or gsutil."""
    target_uri = f"gs://{bucket}/{prefix}"
    cmd = None

    if shutil.which("gcloud"):
        cmd = ["gcloud", "storage", "ls", "--long", target_uri]
    elif shutil.which("gsutil"):
        cmd = ["gsutil", "ls", "-l", target_uri]
    else:
        raise RuntimeError("Neither 'gcloud' nor 'gsutil' CLI is available in PATH.")

    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"Storage listing failed:\n{proc.stderr.strip()}")

    objects = {}
    for line in proc.stdout.splitlines():
        line = line.strip()
        if not line or line.startswith("TOTAL:") or "items" in line:
            continue
        parts = line.split(None, 2)
        if len(parts) == 3 and parts[2].startswith(f"gs://{bucket}/"):
            try:
                size = int(parts[0])
            except ValueError:
                continue
            created = parts[1]
            gs_url = parts[2]
            obj_path = gs_url.replace(f"gs://{bucket}/", "")
            objects[obj_path] = {
                "path": obj_path,
                "size": size,
                "created": created,
                "gs_url": gs_url,
            }

    return objects


def delete_storage_object(gs_url):
    """Deletes an object from Firebase Storage using gcloud storage or gsutil."""
    if shutil.which("gcloud"):
        cmd = ["gcloud", "storage", "rm", gs_url]
    elif shutil.which("gsutil"):
        cmd = ["gsutil", "rm", gs_url]
    else:
        raise RuntimeError("No gcloud or gsutil CLI found to delete.")

    proc = subprocess.run(cmd, capture_output=True, text=True)
    return proc.returncode == 0, proc.stderr.strip()


def main():
    parser = argparse.ArgumentParser(
        description="Find and manage orphaned cover/thumbnail images in Firebase Storage."
    )
    parser.add_argument(
        "--bucket",
        default=DEFAULT_BUCKET,
        help=f"Firebase Storage bucket name (default: {DEFAULT_BUCKET})",
    )
    parser.add_argument(
        "--prefix",
        default=DEFAULT_PREFIX,
        help=f"Path prefix in bucket to check (default: {DEFAULT_PREFIX})",
    )
    parser.add_argument(
        "--db-url",
        default=DEFAULT_DB_URL,
        help=f"Firebase Realtime Database URL (default: {DEFAULT_DB_URL})",
    )
    parser.add_argument(
        "--delete",
        action="store_true",
        help="Delete detected orphaned files from Firebase Storage.",
    )
    parser.add_argument(
        "-y",
        "--yes",
        action="store_true",
        help="Skip confirmation prompt when deleting.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results in JSON format.",
    )

    args = parser.parse_args()

    try:
        reviews_data, referenced_paths = fetch_database_reviews(args.db_url)
    except Exception as e:
        sys.exit(f"Error fetching reviews from database: {e}")

    try:
        bucket_objects = list_bucket_objects(args.bucket, args.prefix)
    except Exception as e:
        sys.exit(f"Error listing bucket objects: {e}")

    orphaned = []
    for path, info in bucket_objects.items():
        if path not in referenced_paths:
            orphaned.append(info)

    # Sort orphans by name
    orphaned.sort(key=lambda x: x["path"])

    # Check for active references pointing to nonexistent files
    missing_from_storage = []
    for path, titles in referenced_paths.items():
        if path.startswith(args.prefix) and path not in bucket_objects:
            missing_from_storage.append({"path": path, "referenced_by": titles})

    if args.json:
        payload = {
            "total_reviews": len(reviews_data),
            "total_bucket_objects": len(bucket_objects),
            "active_storage_references": len(referenced_paths),
            "orphaned_count": len(orphaned),
            "orphaned_files": orphaned,
            "missing_from_storage": missing_from_storage,
        }
        print(json.dumps(payload, indent=2))
        return

    print("=" * 68)
    print("  FIREBASE STORAGE ORPHANED IMAGE CHECKER")
    print("=" * 68)
    print(f"  Database URL:   {args.db_url}")
    print(f"  Storage Bucket: gs://{args.bucket}/{args.prefix}")
    print(f"  Total Reviews:  {len(reviews_data)}")
    print(f"  Files in Store: {len(bucket_objects)}")
    print(f"  Active In DB:   {len(referenced_paths)}")
    print("=" * 68)

    if not orphaned:
        print("\n✓ No orphaned files found! All storage images belong to active reviews.")
    else:
        total_orphan_bytes = sum(o["size"] for o in orphaned)
        print(f"\nFound {len(orphaned)} orphaned file(s) occupying {format_bytes(total_orphan_bytes)}:\n")
        print(f"  {'File Path':<42} {'Size':<10} {'Created'}")
        print(f"  {'-' * 42} {'-' * 10} {'-' * 20}")
        for o in orphaned:
            print(f"  {o['path']:<42} {format_bytes(o['size']):<10} {o['created']}")

    if missing_from_storage:
        print(f"\n⚠ Warning: {len(missing_from_storage)} active review reference(s) missing from storage:")
        for m in missing_from_storage:
            titles = ", ".join(m["referenced_by"])
            print(f"  - {m['path']} (referenced by: {titles})")

    if args.delete and orphaned:
        print("\n" + "-" * 68)
        if not args.yes:
            prompt = input(f"Permanently delete {len(orphaned)} orphaned file(s) from storage? [y/N]: ")
            if prompt.strip().lower() not in ["y", "yes"]:
                print("Deletion aborted.")
                return

        print(f"\nDeleting {len(orphaned)} file(s)...")
        deleted_count = 0
        for o in orphaned:
            success, err = delete_storage_object(o["gs_url"])
            if success:
                print(f"  ✓ Deleted: {o['gs_url']}")
                deleted_count += 1
            else:
                print(f"  ✗ Failed to delete {o['gs_url']}: {err}")
        print(f"\nFinished. Successfully deleted {deleted_count}/{len(orphaned)} file(s).")


if __name__ == "__main__":
    main()
