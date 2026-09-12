#!/usr/bin/env python3
import csv, argparse, pathlib, sys

def norm(v):
    if v is None: return ''
    return ' '.join(v.strip().split())

def main():
    p=argparse.ArgumentParser(description='Clean CSV rows, normalize whitespace, remove exact duplicates, and write a quality report.')
    p.add_argument('input')
    p.add_argument('-o','--output',default='cleaned.csv')
    p.add_argument('--report',default='quality_report.txt')
    args=p.parse_args()
    inp=pathlib.Path(args.input)
    if not inp.exists():
        print('Input file not found', file=sys.stderr); return 2
    with inp.open('r',encoding='utf-8-sig',newline='') as f:
        reader=csv.reader(f); rows=list(reader)
    if not rows:
        print('Empty CSV', file=sys.stderr); return 3
    header=[norm(x) for x in rows[0]]
    width=len(header); cleaned=[]; seen=set(); dupes=0; short=0; long=0; missing=0
    for raw in rows[1:]:
        if len(raw)<width: short+=1; raw=raw+['']*(width-len(raw))
        if len(raw)>width: long+=1; raw=raw[:width]
        row=[norm(x) for x in raw]; missing+=sum(1 for x in row if x=='')
        key=tuple(row)
        if key in seen: dupes+=1; continue
        seen.add(key); cleaned.append(row)
    with open(args.output,'w',encoding='utf-8-sig',newline='') as f:
        w=csv.writer(f); w.writerow(header); w.writerows(cleaned)
    cells=max(1,len(cleaned)*width); completeness=100*(1-missing/cells)
    report=(f'Input rows: {len(rows)-1}\nOutput rows: {len(cleaned)}\nColumns: {width}\nRemoved exact duplicates: {dupes}\nShort rows padded: {short}\nLong rows truncated: {long}\nBlank cells: {missing}\nApprox completeness: {completeness:.1f}%\n')
    pathlib.Path(args.report).write_text(report,encoding='utf-8')
    print(report,end='')
    return 0
if __name__=='__main__': raise SystemExit(main())
