# SiteVerdict Revival Notes

## Working golden path

1. Admin logs in.
2. Admin creates an assessment at `/dashboard/new`.
3. Candidate opens `/test/[assessment_id]`.
4. Candidate records and submits video.
5. Video uploads to Supabase Storage bucket `site-videos`.
6. Submission row is created in `public.submissions`.
7. `transcribe-video` Edge Function processes the submission.
8. Transcript and AI summary are saved.
9. Admin reviews at `/dashboard/review/[submission_id]`.

## Core routes

- `/`
- `/login`
- `/dashboard`
- `/dashboard/new`
- `/test/[id]`
- `/dashboard/review/[id]`
- `/test/success`

## Core tables

- `profiles`
- `assessments`
- `submissions`

## Storage buckets

- `site-videos`
- `assessments`

## Edge functions

- `transcribe-video`
- `notify-fix`
- `send-report`
- `process-audit-video`
- `notify-new-lead`
- `send-lead-email`
- `send-feedback-notification`
- `slack-interactions`

## Verified status

- Video upload works.
- Transcript generation works.
- Review video playback works.
- Review transcript display works.
