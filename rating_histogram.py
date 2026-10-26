#!/usr/bin/env python3
"""
rating_histogram.py - Print a histogram of anime ratings from Firebase Realtime Database.

Fetches review data directly from the Firebase Realtime Database endpoint and prints
a formatted distribution histogram with summary statistics.

Usage:
  python3 rating_histogram.py
  python3 rating_histogram.py --titles
  python3 rating_histogram.py --ascii
  python3 rating_histogram.py --order asc
  python3 rating_histogram.py --json
"""

import argparse
import json
import math
import os
import sys
import urllib.parse
import urllib.request
from collections import defaultdict

DEFAULT_DB_URL = "https://sexy-anime-reviews.firebaseio.com/reviews.json"

# Canonical ratings mapping matching the app's SarRatingSlider & SarCardContainer
RATING_MAP = {
    'epic': 10,
    'superb': 9,
    'great': 8,
    'good': 7,
    'fair': 6,
    'meh': 5,
    'poor': 4,
    'bad': 3,
    'terrible': 2,
    'abysmal': 1,
}

INVERTED_RATINGS = {
    10: 'epic',
    9: 'superb',
    8: 'great',
    7: 'good',
    6: 'fair',
    5: 'meh',
    4: 'poor',
    3: 'bad',
    2: 'terrible',
    1: 'abysmal',
}


def parse_rating(raw_val):
    """
    Parses a rating value into (score: int | None, label: str).
    Returns (None, 'unrated') if missing or invalid.
    """
    if raw_val is None:
        return None, 'unrated'

    # If already a number
    if isinstance(raw_val, (int, float)):
        score = int(round(raw_val))
        if 1 <= score <= 10:
            return score, INVERTED_RATINGS.get(score, str(score))
        return None, 'unrated'

    if isinstance(raw_val, str):
        cleaned = raw_val.strip().lower()
        if not cleaned or cleaned in ('n/a', 'none', 'null', 'unrated'):
            return None, 'unrated'

        # Text label (e.g. "epic", "good")
        if cleaned in RATING_MAP:
            score = RATING_MAP[cleaned]
            return score, cleaned

        # Stringified number (e.g. "8", "8.0")
        try:
            num = float(cleaned)
            score = int(round(num))
            if 1 <= score <= 10:
                return score, INVERTED_RATINGS.get(score, str(score))
        except ValueError:
            pass

    return None, 'unrated'


def fetch_reviews(db_url, auth_token=None, timeout=15):
    """Fetches all reviews directly from Firebase Realtime Database."""
    parsed_url = urllib.parse.urlparse(db_url)
    query_params = urllib.parse.parse_qs(parsed_url.query)

    auth = auth_token or os.environ.get('FIREBASE_AUTH')
    if auth:
        query_params['auth'] = [auth]

    new_query = urllib.parse.urlencode(query_params, doseq=True)
    full_url = urllib.parse.urlunparse(parsed_url._replace(query=new_query))

    req = urllib.request.Request(
        full_url,
        headers={'User-Agent': 'Mozilla/5.0 (compatible; AnimeRatingHistogram/1.0)'}
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read().decode('utf-8')
            return json.loads(data)
    except urllib.error.HTTPError as e:
        sys.stderr.write(f"HTTP Error {e.code}: {e.reason} while fetching {db_url}\n")
        if e.code == 401 or e.code == 403:
            sys.stderr.write("Firebase Database permission denied. Consider passing --auth <token> or setting FIREBASE_AUTH.\n")
        sys.exit(1)
    except urllib.error.URLError as e:
        sys.stderr.write(f"URL Error: {e.reason}\n")
        sys.exit(1)
    except json.JSONDecodeError as e:
        sys.stderr.write(f"Failed to parse JSON response: {e}\n")
        sys.exit(1)


def calculate_statistics(scores):
    """Calculates mean, median, mode, and standard deviation for rated items."""
    if not scores:
        return {
            'mean': 0.0,
            'median': 0.0,
            'mode': [],
            'stdev': 0.0,
        }

    n = len(scores)
    mean_val = sum(scores) / n

    sorted_scores = sorted(scores)
    if n % 2 == 1:
        median_val = float(sorted_scores[n // 2])
    else:
        median_val = (sorted_scores[n // 2 - 1] + sorted_scores[n // 2]) / 2.0

    # Mode
    freq = defaultdict(int)
    for s in scores:
        freq[s] += 1
    max_count = max(freq.values())
    mode_vals = sorted([s for s, c in freq.items() if c == max_count])

    # Standard deviation
    variance = sum((s - mean_val) ** 2 for s in scores) / n
    stdev_val = math.sqrt(variance)

    return {
        'mean': mean_val,
        'median': median_val,
        'mode': mode_vals,
        'stdev': stdev_val,
    }


def render_histogram(brackets, unrated_bracket, total_count, args, stats):
    """Renders formatted ASCII/Unicode terminal histogram."""
    bar_char = '#' if args.ascii else args.char
    max_count = max([b['count'] for b in brackets] + [unrated_bracket['count']] + [1])
    bar_width = max(10, args.bar_width)

    rated_count = sum(b['count'] for b in brackets)
    unrated_count = unrated_bracket['count']

    mode_labels = [f"{m} ({INVERTED_RATINGS.get(m, '')})" for m in stats['mode']]
    mode_str = ", ".join(mode_labels) if mode_labels else "N/A"

    print("\n" + "=" * 70)
    print("                      ANIME RATINGS HISTOGRAM")
    print("=" * 70)
    print(f" Total Reviews: {total_count:<6} | Rated: {rated_count:<6} | Unrated: {unrated_count}")
    if rated_count > 0:
        mean_score = stats['mean']
        closest_label = INVERTED_RATINGS.get(int(round(mean_score)), '')
        print(f" Mean Rating:   {mean_score:.2f} / 10 ({closest_label})")
        print(f" Median Rating: {stats['median']:.1f} / 10")
        print(f" Mode:          {mode_str}")
        print(f" Std Dev:       {stats['stdev']:.2f}")
    print("-" * 70)
    print(f" {'Score':<7} {'Label':<10} {'Count':>6}  {'Pct':>6}   Bar")
    print("-" * 70)

    for b in brackets:
        score_str = f"[{b['score']:>2}]"
        label_str = b['label']
        count = b['count']
        pct = (count / total_count * 100) if total_count > 0 else 0.0

        bar_len = int(round((count / max_count) * bar_width)) if max_count > 0 else 0
        bar = bar_char * bar_len

        print(f" {score_str:<7} {label_str:<10} {count:>6}  {pct:>5.1f}%   {bar}")

        if args.titles and b['titles']:
            sorted_titles = sorted(b['titles'], key=lambda s: s.lower())
            for t in sorted_titles:
                print(f"         · {t}")

    if unrated_count > 0 or args.show_unrated:
        count = unrated_bracket['count']
        pct = (count / total_count * 100) if total_count > 0 else 0.0
        bar_len = int(round((count / max_count) * bar_width)) if max_count > 0 else 0
        bar = bar_char * bar_len

        print("-" * 70)
        print(f" {'[--]':<7} {'unrated':<10} {count:>6}  {pct:>5.1f}%   {bar}")

        if args.titles and unrated_bracket['titles']:
            sorted_titles = sorted(unrated_bracket['titles'], key=lambda s: s.lower())
            for t in sorted_titles:
                print(f"         · {t}")

    print("=" * 70 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Fetch anime reviews directly from Firebase DB and print a ratings histogram."
    )
    parser.add_argument(
        "--db-url",
        default=DEFAULT_DB_URL,
        help="Firebase Realtime Database URL (default: %(default)s)"
    )
    parser.add_argument(
        "--auth",
        default=None,
        help="Firebase auth token or database secret (can also use FIREBASE_AUTH env var)"
    )
    parser.add_argument(
        "--bar-width",
        type=int,
        default=36,
        help="Maximum width in characters for the histogram bars (default: 36)"
    )
    parser.add_argument(
        "--char",
        default="█",
        help="Character to use for histogram bars (default: █)"
    )
    parser.add_argument(
        "--ascii",
        action="store_true",
        help="Use simple '#' ASCII character instead of unicode block for bars"
    )
    parser.add_argument(
        "--order",
        choices=["desc", "asc"],
        default="desc",
        help="Sort order of ratings: 'desc' (10 -> 1) or 'asc' (1 -> 10) (default: desc)"
    )
    parser.add_argument(
        "--titles",
        action="store_true",
        help="List individual anime titles under each rating bracket"
    )
    parser.add_argument(
        "--show-unrated",
        action="store_true",
        help="Always show the unrated row even if count is 0"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results as JSON instead of text histogram"
    )

    args = parser.parse_args()

    # 1. Fetch reviews directly from Firebase Database
    raw_data = fetch_reviews(args.db_url, auth_token=args.auth)

    if not raw_data:
        sys.stderr.write("No reviews found in Firebase Database.\n")
        return

    # Normalizing items (could be dict or list from Firebase REST)
    if isinstance(raw_data, dict):
        review_items = []
        for key, val in raw_data.items():
            if isinstance(val, dict):
                review_items.append((val.get('title') or key, val))
    elif isinstance(raw_data, list):
        review_items = []
        for idx, val in enumerate(raw_data):
            if isinstance(val, dict):
                review_items.append((val.get('title') or f"Review #{idx}", val))
    else:
        sys.stderr.write("Unexpected data format returned from Firebase Database.\n")
        return

    # 2. Group into brackets
    brackets = {
        score: {
            'score': score,
            'label': label,
            'count': 0,
            'titles': []
        }
        for score, label in INVERTED_RATINGS.items()
    }
    unrated_bracket = {
        'score': None,
        'label': 'unrated',
        'count': 0,
        'titles': []
    }

    scores = []
    total_count = len(review_items)

    for title, review in review_items:
        score, label = parse_rating(review.get('rating'))
        if score is not None:
            brackets[score]['count'] += 1
            brackets[score]['titles'].append(title)
            scores.append(score)
        else:
            unrated_bracket['count'] += 1
            unrated_bracket['titles'].append(title)

    stats = calculate_statistics(scores)

    # 3. Format output
    bracket_list = [brackets[s] for s in sorted(brackets.keys(), reverse=(args.order == "desc"))]

    if args.json:
        output_data = {
            'total_reviews': total_count,
            'rated_reviews': len(scores),
            'unrated_reviews': unrated_bracket['count'],
            'statistics': stats,
            'brackets': bracket_list,
            'unrated': unrated_bracket,
        }
        print(json.dumps(output_data, indent=2))
        return

    render_histogram(bracket_list, unrated_bracket, total_count, args, stats)


if __name__ == '__main__':
    main()
