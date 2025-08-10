#!/usr/bin/env python3
"""Test script to check pubDate parsing from RSS feeds"""

import feedparser
from datetime import datetime
import email.utils

def test_cafef_pubdate():
    print("=== Testing CafeF RSS pubDate ===")
    feed = feedparser.parse('https://cafef.vn/thi-truong-chung-khoan.rss')
    
    if feed.entries:
        entry = feed.entries[0]
        print(f"Title: {entry.get('title', 'N/A')}")
        
        # Check available date fields
        print("\nAvailable date fields:")
        if hasattr(entry, 'published'):
            print(f"published: {entry.published}")
        if hasattr(entry, 'published_parsed'):
            print(f"published_parsed: {entry.published_parsed}")
        if hasattr(entry, 'pubDate'):
            print(f"pubDate: {entry.pubDate}")
        if hasattr(entry, 'updated'):
            print(f"updated: {entry.updated}")
        if hasattr(entry, 'updated_parsed'):
            print(f"updated_parsed: {entry.updated_parsed}")
            
        # Test parsing
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            publish_date = datetime(*entry.published_parsed[:6])
            print(f"Parsed date (published_parsed): {publish_date}")
        elif hasattr(entry, 'published') and entry.published:
            try:
                publish_date = datetime.fromtimestamp(
                    email.utils.mktime_tz(email.utils.parsedate_tz(entry.published))
                )
                print(f"Parsed date (published string): {publish_date}")
            except Exception as e:
                print(f"Error parsing published string: {e}")
        else:
            print("No date field found")

def test_vnexpress_pubdate():
    print("\n\n=== Testing VnExpress RSS pubDate ===")
    feed = feedparser.parse('https://vnexpress.net/rss/kinh-doanh.rss')
    
    if feed.entries:
        entry = feed.entries[0]
        print(f"Title: {entry.get('title', 'N/A')}")
        
        # Check available date fields
        print("\nAvailable date fields:")
        if hasattr(entry, 'published'):
            print(f"published: {entry.published}")
        if hasattr(entry, 'published_parsed'):
            print(f"published_parsed: {entry.published_parsed}")
        if hasattr(entry, 'pubDate'):
            print(f"pubDate: {entry.pubDate}")
        if hasattr(entry, 'updated'):
            print(f"updated: {entry.updated}")
        if hasattr(entry, 'updated_parsed'):
            print(f"updated_parsed: {entry.updated_parsed}")
            
        # Test parsing
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            publish_date = datetime(*entry.published_parsed[:6])
            print(f"Parsed date (published_parsed): {publish_date}")
        elif hasattr(entry, 'published') and entry.published:
            try:
                publish_date = datetime.fromtimestamp(
                    email.utils.mktime_tz(email.utils.parsedate_tz(entry.published))
                )
                print(f"Parsed date (published string): {publish_date}")
            except Exception as e:
                print(f"Error parsing published string: {e}")
        else:
            print("No date field found")

if __name__ == "__main__":
    test_cafef_pubdate()
    test_vnexpress_pubdate()
