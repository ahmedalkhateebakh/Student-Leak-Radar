# Must-Done Work

## Goal

We are training a machine learning model using the Open University dataset, but the intended case study is Arab universities. Because the Open University system is different from many Arab university systems, the data must be transformed before modeling.

The main differences discussed:

- Open University modules are often around 8-9 months long.
- Arab university semesters are commonly around 5 months.
- Open University credits are not directly equal to Arab university credit hours.

## 1. Time Normalization

The time difference between the Open University and Arab universities should be handled using percentages rather than raw day numbers.

Instead of using raw values such as:

```text
date = 180
```

we should convert dates into the percentage of the module completed:

```python
relative_time = date / module_presentation_length
```

Then, for an Arab university semester, the same percentage can be mapped to the local semester length:

```python
arab_semester_day = relative_time * arab_semester_length
```

Example:

```text
Open University module length = 250 days
Student activity date = 200

relative_time = 200 / 250 = 0.80

Arab semester length = 150 days
Equivalent Arab semester day = 0.80 * 150 = 120
```

This allows the model to learn student behavior by course stage rather than by Open University day numbers.

## 2. Recommended Time-Based Features

For machine learning, we should create features based on course progress windows:

- Activity in the first 25% of the course
- Activity in the first 50% of the course
- Activity in the last 25% of the course
- Total active days
- Total clicks
- Clicks per active day
- Assessment submissions before certain course-progress thresholds
- Late submissions based on normalized assessment timing

This supports early-warning models and makes the model easier to apply to shorter Arab university semesters.

## 3. Credit Problem

The `studentInfo.csv` column:

```text
studied_credits
```

means:

```text
Total number of credits for the modules the student is currently studying.
```

This is not the credit value of only the current module. It represents the student's total study load across modules during the same period.

Therefore, we should not directly interpret:

```python
studied_credits * 10
```

as the number of study hours for the current module.

The official Open University credit rule says:

```text
1 credit is approximately 10 hours of study over the duration of the course.
```

But in this dataset, because `studied_credits` refers to all modules currently studied, it should be treated as a workload indicator, not as the exact number of hours for one module.

## 4. Observed `studied_credits` Distribution

From `studentInfo.csv`:

| Metric | Value |
|---|---:|
| Total rows | 32,593 |
| Minimum | 30 |
| Median | 60 |
| 75th percentile | 120 or less |
| 95th percentile | 150 or less |
| 99th percentile | 240 or less |
| Maximum | 655 |
| Rows greater than 120 | 2,256 |
| Rows greater than 240 | 116 |
| Rows greater than 300 | 35 |
| Rows 600 or greater | 2 |

The very large values are rare and are not representative of normal student workload.

## 5. Agreed Decision for `studied_credits`

We agreed that values greater than 250 should be treated as outliers for the current modeling goal.

Decision:

```python
df = df[df["studied_credits"] <= 250].copy()
```

Reason:

- Values greater than 250 are very rare.
- Removing them preserves almost all of the dataset.
- These values are difficult to map to Arab university credit-hour systems.
- They may introduce noise into a model intended for Arab university use.
- This makes the workload feature more realistic and transferable.

## 6. Workload Normalization

We should not map:

```text
Open University credit = Arab university credit hour
```

directly.

Instead, we should map both systems into a normalized workload ratio.

For Open University data:

```python
FULL_LOAD_OU = 120
df["workload_ratio"] = df["studied_credits"] / FULL_LOAD_OU
```

For Arab university data:

```python
FULL_LOAD_ARAB = 15
arab_df["workload_ratio"] = arab_df["registered_credit_hours"] / FULL_LOAD_ARAB
```

The exact value of `FULL_LOAD_ARAB` should be adjusted based on the target university policy. If the normal full load is 15 credit hours, use 15. If it is 18, use 18.

## 7. Recommended Workload Categories

After filtering out extreme values, we can create interpretable workload categories.

Suggested Open University categories:

```python
df["workload_level"] = pd.cut(
    df["studied_credits"],
    bins=[0, 60, 120, 180, 250],
    labels=["light", "normal", "high", "very_high"],
    include_lowest=True
)
```

Suggested normalized categories:

```python
df["workload_ratio"] = df["workload_ratio"].clip(upper=2.0)

df["workload_level"] = pd.cut(
    df["workload_ratio"],
    bins=[0, 0.5, 1.0, 1.5, 2.0],
    labels=["light", "normal", "high", "very_high"],
    include_lowest=True
)
```

## 8. Modeling Direction

The model should learn general student-risk patterns, not Open University-specific calendar behavior.

Recommended target:

```text
final_result
```

Possible tasks:

- Multiclass prediction: `Distinction`, `Pass`, `Fail`, `Withdrawn`
- Binary withdrawal prediction: `Withdrawn` vs. not withdrawn
- Binary success prediction: `Pass` or `Distinction` vs. `Fail` or `Withdrawn`

For Arab university application, the most practical first model is likely:

```text
At-risk prediction: successful vs. at-risk
```

where:

```text
successful = Pass or Distinction
at-risk = Fail or Withdrawn
```

## 9. Must-Do Preprocessing Checklist

Before training:

- Normalize dates by module progress percentage.
- Aggregate event-level tables before joining.
- Use one row per `id_student`, `code_module`, and `code_presentation`.
- Remove `studied_credits > 250`.
- Convert `studied_credits` into workload features.
- Avoid using future information for early-warning models.
- Do not directly compare Open University credits to Arab university credit hours.
- Use workload ratios instead of raw credit systems when applying the model to Arab universities.

