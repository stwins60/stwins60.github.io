#!/usr/bin/env bash

for filename in *.md; do
  pandoc "$filename" -o "${filename%.*}.pdf"
  echo "[OK] $filename"
done
