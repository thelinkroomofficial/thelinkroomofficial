import json

file_path = r"D:\webcore main V2\js\website.json"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    seen_urls = set()
    unique_items = []
    duplicates = 0

    for item in data:
        url = item.get("url", "")
        # Normalize trailing slashes for better deduplication if desired, 
        # but let's stick to exact matches first to be safe.
        if url in seen_urls:
            duplicates += 1
        else:
            seen_urls.add(url)
            unique_items.append(item)

    print(f"Total links: {len(data)}")
    print(f"Unique links: {len(unique_items)}")
    print(f"Duplicate links: {duplicates}")

except Exception as e:
    print(f"Error: {e}")
