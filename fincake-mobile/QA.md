# FinCake QA Checklist

## Setup
- [ ] Expo app runs on device (iOS/Android)
- [ ] Supabase URL + anon key configured
- [ ] News tables seeded or ingested

## Thị trường
- [ ] On open, skeleton shows then clusters render
- [ ] Pull-to-refresh reloads data
- [ ] Tapping “Hỏi AI về chủ đề này” switches to AI tab with prefill
- [ ] Offline mode: turn off network, last clusters still show

## Portfolio
- [ ] Add a symbol row (Mã CP, Số lượng, Giá vốn)
- [ ] Edit and delete rows work
- [ ] Restart app: data persists
- [ ] Validation blocks empty/negative values

## AI Chat
- [ ] Enter question, send → user bubble shows instantly
- [ ] Assistant reply appears (after Edge Function returns)
- [ ] Prefill from Thị trường works

## Links & Safety
- [ ] Tap an article opens browser
- [ ] Malformed URL doesn’t crash; shows an error/alert

## Localization
- [ ] All visible strings are Vietnamese

## Devices
- [ ] iPhone X (375×812) layout OK
- [ ] Android 360×800 layout OK
