# Data Exploration Report

## Dataset Overview

The raw folder contains seven CSV files matching the ERD shown in the request. The data follows a relational structure around students, course presentations, assessments, registrations, and virtual learning environment activity.

This dataset is related to the Open University, a UK university known for distance learning and online study. That context is important: the VLE records are not just website logs, but learning-behavior traces from students studying remotely. The dataset is therefore best understood as a learning analytics dataset for studying how demographics, registration behavior, assessment performance, and online engagement relate to student outcomes.

| File | Rows | Columns | Main purpose |
|---|---:|---:|---|
| `assessments.csv` | 206 | 6 | Assessment definitions by module and presentation |
| `courses.csv` | 22 | 3 | Course presentation metadata |
| `studentAssessment.csv` | 173,912 | 5 | Student assessment submissions and scores |
| `studentInfo.csv` | 32,593 | 12 | Student demographics and final result |
| `studentRegistration.csv` | 32,593 | 5 | Registration and unregistration dates |
| `studentVle.csv` | 10,655,280 | 6 | Student VLE click events by site and day |
| `vle.csv` | 6,364 | 6 | VLE site metadata and activity types |

## Data Dictionary

### `assessments.csv`

| Column | Description |
|---|---|
| `code_module` | Code name of the module. |
| `code_presentation` | Code name of the presentation, such as `2013B` for February or `2013J` for October. |
| `id_assessment` | Identification number of the assessment. |
| `assessment_type` | Type of assessment: Tutor Marked Assessment (`TMA`), Computer Marked Assessment (`CMA`), or final exam. |
| `date` | Submission date of the assessment, measured as days since the start of the module presentation. |
| `weight` | Weight of the assessment as a percentage. Exams commonly have 100%; other assessments usually sum to 100%. |

### `courses.csv`

| Column | Description |
|---|---|
| `code_module` | Code name of the module. |
| `code_presentation` | Code name of the presentation, such as `2013B` for February or `2013J` for October. |
| `module_presentation_length` | Length of the module presentation in days. |

### `studentAssessment.csv`

| Column | Description |
|---|---|
| `id_assessment` | Identification number of the assessment. |
| `id_student` | Unique identification number for the student. |
| `date_submitted` | Date of student submission, measured as days since the start of the module presentation. |
| `is_banked` | Flag indicating whether the assessment result was transferred from a previous presentation. |
| `score` | Student score for the assessment, from 0 to 100. Scores below 40 are considered failing scores. |

### `studentInfo.csv`

| Column | Description |
|---|---|
| `code_module` | Code name of the module. |
| `code_presentation` | Code name of the presentation, such as `2013B` for February or `2013J` for October. |
| `id_student` | Unique identification number for the student. |
| `gender` | Gender of the student. |
| `region` | Geographic region where the student lived while taking the module presentation. |
| `highest_education` | Highest student education level on entry to the module presentation. |
| `imd_band` | Index of Multiple Deprivation band for the student's location during the module presentation. |
| `age_band` | Student age band. |
| `num_of_prev_attempts` | Number of times the student previously attempted this module. |
| `studied_credits` | Total number of credits for the modules the student was currently studying. |
| `disability` | Whether the student declared a disability. |
| `final_result` | Final outcome for the student in the module presentation. |

### `studentRegistration.csv`

| Column | Description |
|---|---|
| `code_module` | Code name of the module. |
| `code_presentation` | Code name of the presentation. |
| `id_student` | Unique identification number for the student. |
| `date_registration` | Student registration date for the module presentation, relative to the start of the module. |
| `date_unregistration` | Student unregistration date from the module presentation, relative to the start of the module. |

### `studentVle.csv`

| Column | Description |
|---|---|
| `code_module` | Code name of the module. |
| `code_presentation` | Code name of the presentation. |
| `id_student` | Unique identification number for the student. |
| `id_site` | Identification number for the VLE material. |
| `date` | Date of student interaction with the material, measured as days since the start of the module. |
| `sum_click` | Number of times a student interacted with the material on that day. |

### `vle.csv`

| Column | Description |
|---|---|
| `id_site` | Identification number for the VLE material. |
| `code_module` | Code name of the module. |
| `code_presentation` | Code name of the presentation. |
| `activity_type` | Role or category associated with the module material. |
| `week_from` | Week from which the material was planned to be used. |
| `week_to` | Week until which the material was planned to be used. |

Note: the user-provided description used `module_presentation` and `assesment_type`; the actual CSV columns are `module_presentation_length` and `assessment_type`.

## Key Relationships

The safest flat-file grain is one row per student course attempt:

`id_student` + `code_module` + `code_presentation`

Recommended joins:

| Source | Join key | Relationship |
|---|---|---|
| `studentInfo` to `studentRegistration` | `id_student`, `code_module`, `code_presentation` | one-to-one |
| `studentInfo` to `courses` | `code_module`, `code_presentation` | many-to-one |
| `studentAssessment` to `assessments` | `id_assessment` | many-to-one |
| assessment features to `studentInfo` | `id_student`, `code_module`, `code_presentation` after joining assessment metadata | one-to-one after aggregation |
| `studentVle` to `vle` | `id_site`, `code_module`, `code_presentation` | many-to-one |
| VLE features to `studentInfo` | `id_student`, `code_module`, `code_presentation` after aggregation | one-to-one after aggregation |

## Important Findings

- `studentInfo.csv` and `studentRegistration.csv` both contain 32,593 student course attempts.
- There are 28,785 unique students, so some students appear in multiple course presentations.
- The dataset includes 7 modules: `AAA`, `BBB`, `CCC`, `DDD`, `EEE`, `FFF`, and `GGG`.
- The dataset includes 4 presentations: `2013B`, `2013J`, `2014B`, and `2014J`.
- `studentVle.csv` is by far the largest table, with 10,655,280 rows and 39,605,099 total clicks.
- A row-level merge of all tables is not recommended because `studentVle` and `studentAssessment` are event tables. They should be aggregated first.

## Missing Values

| Table | Column | Missing rows | Notes |
|---|---|---:|---|
| `assessments.csv` | `date` | 11 | Mainly assessment definitions without a known date |
| `studentAssessment.csv` | `score` | 173 | Submitted assessments with missing score |
| `studentInfo.csv` | `imd_band` | 1,111 | Missing deprivation band |
| `studentRegistration.csv` | `date_registration` | 45 | Missing registration date |
| `studentRegistration.csv` | `date_unregistration` | 22,521 | Usually means the student did not unregister |
| `vle.csv` | `week_from` | 5,243 | Many VLE sites do not have week boundaries |
| `vle.csv` | `week_to` | 5,243 | Many VLE sites do not have week boundaries |

## Target Variable

`studentInfo.final_result` is the natural target for later supervised analysis.

| Final result | Count |
|---|---:|
| Pass | 12,361 |
| Withdrawn | 10,156 |
| Fail | 7,052 |
| Distinction | 3,024 |

Possible modeling targets:

- Multiclass classification: predict `Distinction`, `Pass`, `Fail`, or `Withdrawn`.
- Binary classification: predict `Withdrawn` vs. not withdrawn.
- Binary classification: predict successful completion, where `Pass` and `Distinction` are success.

## Assessment Summary

Assessment definitions:

| Type | Count |
|---|---:|
| TMA | 106 |
| CMA | 76 |
| Exam | 24 |

Student assessment rows:

- Total submissions: 173,912
- Banked assessments: 1,909
- Non-banked assessments: 172,003
- Student course attempts with assessment features: 25,843, about 79.29% of `studentInfo`

Recommended assessment features:

- Number of submitted assessments
- Mean, minimum, and maximum score
- Weighted score using assessment `weight`
- Number of late submissions where `date_submitted > date`
- Number of banked assessments
- Submission counts and mean scores by `assessment_type`

## VLE Activity Summary

VLE site metadata includes 20 activity types. The most important click categories by total clicks are:

| Activity type | Total clicks |
|---|---:|
| oucontent | 11,206,803 |
| forumng | 7,973,390 |
| quiz | 6,981,240 |
| homepage | 6,949,064 |
| subpage | 3,411,582 |
| resource | 1,110,132 |
| ouwiki | 894,512 |
| url | 566,702 |
| oucollaborate | 108,974 |
| glossary | 87,962 |

Student course attempts with VLE activity: 29,228, about 89.68% of `studentInfo`.

Recommended VLE features:

- Total clicks
- Number of active days
- First and last VLE activity day
- Number of unique VLE sites visited
- Clicks per active day
- Click totals by `activity_type`

## Recommended Flat File Design

Build the flat file from `studentInfo.csv` because it already has one row per student course attempt and contains `final_result`.

Steps:

1. Start with `studentInfo`.
2. Join `studentRegistration` on `id_student`, `code_module`, and `code_presentation`.
3. Join `courses` on `code_module` and `code_presentation`.
4. Join `studentAssessment` to `assessments` using `id_assessment`.
5. Aggregate assessment features by `id_student`, `code_module`, and `code_presentation`.
6. Join `studentVle` to `vle` using `id_site`, `code_module`, and `code_presentation`.
7. Aggregate VLE features by `id_student`, `code_module`, and `code_presentation`.
8. Merge the aggregated assessment and VLE feature tables back to the base table.

Expected final grain:

`one row = one student in one module presentation`

Expected row count:

`32,593 rows`, assuming `studentInfo` remains the base table.

## Notebook

The exploration notebook was created at:

`project/notebooks/DataExploration.ipynb`

It includes:

- File and column inspection
- Missing-value checks
- Categorical summaries
- Relationship checks
- Assessment feature aggregation
- VLE click feature aggregation
- Code to assemble a flat student course attempt table
