import sys, re
sys.stdout.reconfigure(encoding="utf-8")

path = "hadithunlocked_data/hakim.json"
with open(path, "rb") as f:
    raw = f.read()

decoded = raw.decode("utf-8", errors="replace")

# Find the area around position 10695156
pos = 10695156
area = decoded[max(0,pos-200):pos+500]
print(f"Around pos {pos}:")
# Show exact chars
for i, ch in enumerate(area):
    if ord(ch) < 32 or ord(ch) > 126:
        if ch not in "\n\r\t ":
            print(f"  Char at offset {max(0,pos-200)+i}: U+{ord(ch):04X} = {repr(ch)}")

# Also scan the entire file for control characters in problematic areas
print("\nScanning for issues near line 161162...")
lines = decoded.split("\n")
if len(lines) >= 161162:
    line = lines[161161]  # 0-indexed
    print(f"Line 161162: {line[:200]}")
    print(f"Next line: {lines[161162][:200]}" if len(lines) > 161162 else "EOF")
    
    # Check for unescaped quotes
    # Find strings that might have unescaped quotes
    for offset in range(-5, 5):
        idx = 161161 + offset
        if 0 <= idx < len(lines):
            print(f"\n  Line {idx+1}: {lines[idx][:300]}")
