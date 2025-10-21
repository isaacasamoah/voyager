# Known Bugs - Voyager Platform

## Active Bugs

### 1. Add Context: Multiple files overwrite previous context (Careersy)

**Component:** Careersy - Add Context feature
**Severity:** Medium
**Status:** Open

**Description:**
When adding multiple context files (resume, job description, etc.) via the "Add Context" button in Careersy, uploading a second file overwrites the previously uploaded context instead of appending or storing multiple files.

**Expected behavior:**
- User should be able to upload multiple context files
- Each file should be stored separately or combined
- All uploaded context should be available to the AI

**Actual behavior:**
- Second file upload replaces first file
- Previous context is lost

**Steps to reproduce:**
1. Go to Careersy community
2. Click "Add Context" button
3. Upload resume file
4. Click "Add Context" again
5. Upload job description file
6. Resume context is now lost, only job description remains

**Potential fix:**
- Update resume modal/API to support multiple files
- Store multiple context types (resume, JD, LinkedIn, etc.) separately
- Or concatenate files with clear delimiters

**Priority:** Medium (affects user workflow, but workaround exists - paste all context at once)

---

## Fixed Bugs

_None yet_

---

## Bug Reporting Template

When adding new bugs, use this format:

```markdown
### [Bug Number]. [Short Description]

**Component:** [Feature/Component name]
**Severity:** [Critical/High/Medium/Low]
**Status:** [Open/In Progress/Fixed]

**Description:**
[Clear description of the bug]

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happens]

**Steps to reproduce:**
1. [Step 1]
2. [Step 2]
3. [Result]

**Potential fix:**
[Ideas for how to fix it]

**Priority:** [Critical/High/Medium/Low] ([Reasoning])
```
