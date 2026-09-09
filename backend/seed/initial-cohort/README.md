# Initial cohort draft content

Four courses adapted from the supplied React, Vue, JavaScript/Node.js and Python/Django outlines. Each contains six classes, ten questions per class, six assignments with 100-point rubrics, references and configurable completion criteria. Total: **24 classes, 240 questions and 24 assignments/rubrics**.

The ten source modules are condensed into six class groups: 1–2, 3–4, 5, 6, 7–8 and 9–10. Paired groups use ten questions from the supplied twelve; single groups include four additional application questions. Source filenames and hashes are recorded in each JSON file.

## Validate or import

Run `python import_courses.py` for offline validation. To load the packages into a running backend, run `python import_courses.py --apply --base-url http://localhost:8080`. Enter an administrator email and password at the prompts, or supply `LMS_ADMIN_TOKEN` through your environment. Credentials are not stored in the journal. Remote servers require HTTPS.

The importer creates separate **unpublished** courses through the existing admin APIs. It does not overwrite an existing course with the same slug. Completed operations are journaled for resumption. If a request has an uncertain outcome, the importer stops instead of retrying a potentially successful create; reconcile that operation against the admin data before resuming. Keep the journal with the imported environment.

## Instructor preparation

- Review the condensed pace and prerequisites; these are introductory guided packages, not a replacement for the full ten-module tracks.
- Review teaching notes, code snippets, questions and answer keys; run framework snippets inside their stated project context.
- Set the instructor, real pricing and launch metadata. The draft price is zero and must be reviewed.
- Assign each class to its cohort and set its live date, meeting link and optional recording. Dates and links are intentionally empty.
- Set assignment deadlines; the suggested window is seven days after each class.
- Completion requires all classes, all quiz passes, all assignments reviewed, and 80% attendance. Each quiz allows three attempts at a 70% passing threshold. A reviewed assignment satisfies the current platform rule regardless of score; use Needs Resubmission when correction is required.
- Publish only after reviewing the course as a student. Draft files contain answer keys and belong in backend tooling, never the public frontend assets.

The importer does not send invitations or create enrollments. No live course has been published by generating these files.

Each assignment now also includes five structured scoring criteria (35/25/20/10/10 points). The importer configures them before students submit. Criteria become locked once submissions begin, and student reviews retain the awarded marks and criterion feedback.
