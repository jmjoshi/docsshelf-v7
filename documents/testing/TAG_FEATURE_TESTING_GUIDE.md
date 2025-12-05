# DocsShelf Tags Feature - Testing Guide

## Overview
The Tags feature allows users to organize documents with custom tags, making it easier to categorize and find documents across different folders.

---

## Features Implemented

### 1. **Tag Service** (`src/services/database/tagService.ts`)
- ✅ Create tags with custom names and colors
- ✅ Get all tags for current user
- ✅ Get tags with usage count
- ✅ Update tag name and color
- ✅ Delete tags
- ✅ Add tags to documents
- ✅ Remove tags from documents
- ✅ Get all tags for a document
- ✅ Set tags for document (replace all)
- ✅ Get documents by tag
- ✅ Search tags by name
- ✅ Get tag statistics

### 2. **Tag Redux Slice** (`src/store/slices/tagSlice.ts`)
- ✅ State management for tags
- ✅ Async thunks for all tag operations
- ✅ Tag selection for filtering
- ✅ Document tags caching
- ✅ Multiple selectors for different views

### 3. **UI Components**
- ✅ **TagChip** - Displays a single tag badge with color
- ✅ **TagList** - Displays multiple tags in scrollable/wrapped view
- ✅ **TagPicker** - Modal for selecting/creating tags

### 4. **Tag Management Screen** (`src/screens/Settings/TagManagementScreen.tsx`)
- ✅ View all tags with usage statistics
- ✅ Create new tags with color picker
- ✅ Edit existing tags
- ✅ Delete tags with confirmation
- ✅ Search tags
- ✅ Statistics dashboard

### 5. **Document Integration**
- ✅ Tag selection in Document Edit Screen
- ✅ Tag display in document details
- ✅ Bulk tag operations

---

## How to Test

### Prerequisites
1. Ensure the app is running:
   ```powershell
   npm start
   ```

2. Have at least one document uploaded in the app
3. Be logged in with a registered user

---

## Test Scenarios

### Scenario 1: Create Tags

**Steps:**
1. Navigate to **Settings** → **Tags** (or use route `/settings/tags`)
2. You should see the Tag Management Screen with:
   - Statistics showing 0 tags, 0 tagged documents
   - Empty state message: "No tags yet"
   - "+" button in the top right

3. **Create First Tag:**
   - Tap the "+" button
   - Enter tag name: `Work`
   - Select a blue color from the color palette
   - Tap "Save"
   
4. **Verify:**
   - Tag appears in the list
   - Statistics show: 1 total tag, 0 tagged documents
   - Tag has blue color indicator

5. **Create More Tags:**
   Repeat to create these tags:
   - `Personal` (green)
   - `Urgent` (red)
   - `Archive` (gray)
   - `2024` (yellow)

**Expected Results:**
- All 5 tags created successfully
- Each tag displays with correct name and color
- Statistics show 5 total tags
- No errors displayed

---

### Scenario 2: Edit Tags

**Steps:**
1. In Tag Management Screen, find the `Work` tag
2. Tap the **pencil icon** (edit button)
3. Change name to `Business`
4. Change color to dark blue
5. Tap "Save"

6. **Verify:**
   - Tag name updated to "Business"
   - Color changed to dark blue
   - Tag still shows 0 documents (if not yet tagged)

7. **Try Duplicate Name:**
   - Edit `Personal` tag
   - Try changing name to `Business` (existing tag)
   - Tap "Save"

**Expected Results:**
- First edit succeeds
- Duplicate name attempt shows error: "A tag with this name already exists"
- Original tag remains unchanged

---

### Scenario 3: Search Tags

**Steps:**
1. In Tag Management Screen with 5 tags created
2. Type `ur` in the search box
3. **Verify:** Only `Urgent` tag is displayed
4. Clear search (tap X icon)
5. **Verify:** All tags reappear

**Expected Results:**
- Search filters tags correctly
- Case-insensitive search works
- Clear button removes filter

---

### Scenario 4: Add Tags to Document

**Steps:**
1. Navigate to **Documents** screen
2. Select any document
3. Tap **Edit** or open Document Edit Screen
4. Scroll to the "Tags" section
5. Tap on the tag selector (shows "Add tags..." if empty)

6. **Tag Picker Opens:**
   - Shows all available tags (5 tags created earlier)
   - Shows "Create New Tag" button
   - Each tag shows its document count (0 for new tags)

7. **Select Multiple Tags:**
   - Tap `Business` - checkmark appears
   - Tap `Urgent` - checkmark appears
   - Tap `2024` - checkmark appears
   
8. **Verify Selected Tags Preview:**
   - Top of modal shows "Selected (3)"
   - Shows 3 selected tags as chips
   - Each chip has X button to remove

9. Tap **Save** button
10. **Verify in Edit Screen:**
    - Tags section now shows 3 colored tag chips
    - Each tag displays correctly

11. Tap main **Save** button to save document changes

**Expected Results:**
- Tag picker opens correctly
- Multiple selection works
- Selected tags preview updates in real-time
- Tags save to document successfully
- No errors displayed

---

### Scenario 5: View Tagged Document in Tag Management

**Steps:**
1. Go back to **Settings** → **Tags**
2. **Verify Statistics:**
   - Total Tags: 5
   - Tagged Documents: 1
   - Avg Tags/Doc: 3.0

3. **Verify Tag Usage:**
   - `Business` tag shows "1 document"
   - `Urgent` tag shows "1 document"
   - `2024` tag shows "1 document"
   - `Personal` and `Archive` show "0 documents"

**Expected Results:**
- Statistics accurately reflect tagging
- Usage counts display correctly
- Tags sorted alphabetically

---

### Scenario 6: Remove Tags from Document

**Steps:**
1. Open the tagged document in Edit mode
2. Tap on Tags section to open Tag Picker
3. **Verify:** `Business`, `Urgent`, `2024` are selected (checked)
4. Tap `Urgent` to deselect it
5. **Verify:** Checkmark removed, "Selected (2)" shown
6. Tap **Save**
7. **Verify in Edit Screen:** Only 2 tags displayed
8. Save document

9. **Go to Tag Management:**
   - `Urgent` now shows "0 documents"
   - Others remain "1 document"

**Expected Results:**
- Tag removal works correctly
- Statistics update immediately
- Document updates successfully

---

### Scenario 7: Create Tag from Tag Picker

**Steps:**
1. Edit a document
2. Open Tag Picker
3. Tap **"Create New Tag"** button
4. **Verify:** Input field appears with Save/Cancel buttons
5. Type tag name: `Important`
6. Tap green checkmark (Save)

7. **Verify:**
   - New tag created with random color
   - Automatically added to selected tags
   - Tag appears in the list
   - "Selected" count increments

8. Tap Save, then save document
9. Go to Tag Management
10. **Verify:** `Important` tag exists with 1 document

**Expected Results:**
- Tag creation from picker works
- Auto-selection after creation
- Tag persists in database
- No errors

---

### Scenario 8: Delete Unused Tag

**Steps:**
1. In Tag Management Screen
2. Find `Archive` tag (0 documents)
3. Tap **trash icon** (delete button)
4. **Verify Alert:**
   - Message: "Are you sure you want to delete this tag?"
   - Two buttons: Cancel, Delete
5. Tap **Delete**

6. **Verify:**
   - Tag removed from list
   - Statistics updated (4 total tags)
   - No error

**Expected Results:**
- Unused tag deletes immediately
- Confirmation dialog appears
- Statistics update correctly

---

### Scenario 9: Delete Used Tag

**Steps:**
1. In Tag Management, find `Business` tag (1 document)
2. Tap trash icon
3. **Verify Alert:**
   - Message: "This tag is used in 1 document. Are you sure you want to delete it?"
   - Warning about usage
4. Tap **Cancel** first
5. **Verify:** Tag still exists

6. **Repeat Delete:**
7. Tap trash icon again
8. Tap **Delete** this time
9. **Verify:**
   - Tag deleted
   - Statistics updated

10. **Check Tagged Document:**
    - Open document in Edit mode
    - `Business` tag no longer appears
    - Other tags intact

**Expected Results:**
- Warning shown for used tags
- Cancel preserves tag
- Delete removes from tag list and documents
- No orphaned associations

---

### Scenario 10: Tag Multiple Documents

**Steps:**
1. Create/Open 3 different documents
2. Tag each document:
   - **Doc 1:** `Work`, `Urgent`
   - **Doc 2:** `Personal`, `2024`
   - **Doc 3:** `Work`, `Personal`, `2024`

3. **Go to Tag Management**
4. **Verify Usage Counts:**
   - `Work`: 2 documents
   - `Personal`: 2 documents
   - `Urgent`: 1 document
   - `2024`: 2 documents

5. **Verify Statistics:**
   - Total Tags: 4 (or more)
   - Tagged Documents: 3
   - Avg Tags/Doc: ~1.7-2.3 (depends on tag distribution)

**Expected Results:**
- Multiple documents can share tags
- Usage counts accurate
- Statistics calculate correctly
- No duplicates or errors

---

### Scenario 11: Tag Color Customization

**Steps:**
1. Create new tag or edit existing
2. **Verify Color Palette:**
   - 20 preset colors available
   - Colors arranged in grid
   - Selected color has border highlight

3. **Change Colors:**
   - Select each color one by one
   - Preview chip updates immediately
   - Color indicator changes

4. Save tag
5. **Verify:**
   - Tag displays with chosen color
   - Color persists after app restart

**Expected Results:**
- All 20 colors selectable
- Preview updates in real-time
- Color saves correctly
- Consistent display everywhere

---

### Scenario 12: Tag Name Validation

**Test Empty Name:**
1. Create new tag
2. Leave name field empty
3. Tap Save
4. **Expected:** Alert "Tag name cannot be empty"

**Test Long Name:**
1. Create tag with 60 character name
2. **Expected:** Input limited to 50 characters
3. Character counter shows "50/50"

**Test Duplicate Name (Case-Insensitive):**
1. Create tag "urgent" (lowercase)
2. Try creating "URGENT" (uppercase)
3. **Expected:** Error "A tag with this name already exists"

**Test Special Characters:**
1. Create tag with name: `Work/Home`
2. **Expected:** Should succeed (special chars allowed)

**Expected Results:**
- All validations work correctly
- Clear error messages
- No crashes

---

### Scenario 13: Tag Search Functionality

**Steps:**
1. Create 10+ tags with various names
2. **Test Partial Match:**
   - Search "wor" → Shows "Work", "Homework"
   - Search "202" → Shows "2024", "2023"

3. **Test Case-Insensitive:**
   - Search "URGENT" → Shows "urgent", "Urgent"

4. **Test No Results:**
   - Search "xyz123"
   - **Expected:** "No tags found" message

5. **Test Special Characters:**
   - Search "/" → Shows tags with slashes

**Expected Results:**
- Search is fast and responsive
- Case-insensitive matching
- Partial matches work
- Empty state displays correctly

---

### Scenario 14: Bulk Tag Operations

**Steps:**
1. Open document with 5 tags
2. Open Tag Picker
3. Deselect all 5 tags
4. Select 3 different tags
5. Save

6. **Verify:**
   - All old tags removed
   - All new tags added
   - Single save operation

7. **Check Tag Management:**
   - Old tags show reduced counts
   - New tags show increased counts

**Expected Results:**
- Bulk replacement works atomically
- No partial updates
- Statistics accurate

---

### Scenario 15: Error Handling

**Test Network/Database Error Simulation:**

1. **Invalid Tag ID:**
   - Try accessing tag with ID 99999
   - **Expected:** Error handled gracefully

2. **Concurrent Modifications:**
   - Edit same tag from two devices simultaneously
   - **Expected:** Last write wins, no corruption

3. **Large Number of Tags:**
   - Create 100+ tags
   - **Expected:** Performance remains good
   - UI scrolls smoothly

**Expected Results:**
- No crashes
- User-friendly error messages
- Data integrity maintained

---

## Performance Tests

### Test 1: Tag Rendering
- **Create 50 tags**
- **Expected:** List scrolls smoothly (60 FPS)
- **Load Time:** < 500ms

### Test 2: Tag Picker with Many Tags
- **Open picker with 100 tags**
- **Expected:** Opens quickly
- **Search:** Instant filtering

### Test 3: Document with Many Tags
- **Add 20 tags to single document**
- **Expected:** All display correctly
- **Scrollable** if needed

---

## Database Verification

### Check Tag Tables:

**Run SQL queries to verify data:**

```sql
-- View all tags
SELECT * FROM tags ORDER BY name;

-- View tag usage
SELECT 
  t.name,
  COUNT(dt.document_id) as doc_count
FROM tags t
LEFT JOIN document_tags dt ON t.id = dt.tag_id
GROUP BY t.id
ORDER BY doc_count DESC;

-- View document tags
SELECT 
  d.filename,
  GROUP_CONCAT(t.name) as tags
FROM documents d
LEFT JOIN document_tags dt ON d.id = dt.document_id
LEFT JOIN tags t ON dt.tag_id = t.id
GROUP BY d.id;
```

**Expected:**
- No orphaned tags
- No orphaned associations
- Correct foreign key relationships
- Proper user isolation

---

## Edge Cases to Test

### 1. Special Characters in Tag Names
- Test: `#hashtag`, `@mention`, `work/home`, `🔥fire`
- **Expected:** All should work

### 2. Maximum Tags per Document
- Add 50+ tags to one document
- **Expected:** All save and display

### 3. Tag with Same Name Different Case
- Create "work" and try "WORK"
- **Expected:** Blocked (case-insensitive unique)

### 4. Delete Document with Tags
- Tag a document, then delete document
- **Expected:** Tag associations removed automatically (CASCADE)

### 5. User Isolation
- Create tags as User A
- Login as User B
- **Expected:** User B cannot see User A's tags

---

## Regression Tests

After implementing tags, verify these still work:

- ✅ **Document Upload** - Works without tags
- ✅ **Document Edit** - Other fields still editable
- ✅ **Document Delete** - Deletes tags properly
- ✅ **Category Management** - Not affected by tags
- ✅ **Search** - Still works (future: include tag search)
- ✅ **Backup/Restore** - Tags included in backup

---

## Known Limitations

1. **Tag Filtering in Document List:** Not yet implemented (marked for Phase 2)
2. **Tag-based Search:** Planned but not implemented
3. **Tag Statistics Dashboard:** Basic stats only
4. **Tag Analytics:** Not implemented
5. **Tag Suggestions:** Not implemented

---

## Common Issues & Solutions

### Issue: Tags not showing after creation
**Solution:** 
- Refresh the tag list: `dispatch(loadTags())`
- Check Redux DevTools for state

### Issue: Tag deleted but still appears
**Solution:**
- Check database CASCADE delete rules
- Verify foreign key constraints

### Issue: Can't create tag with existing name
**Solution:**
- This is intentional (case-insensitive unique constraint)
- Use different name or edit existing tag

### Issue: Tag colors not displaying
**Solution:**
- Verify color format is hex (#RRGGBB)
- Check TagChip component props

---

## Testing Checklist

**Basic Operations:**
- [ ] Create tag
- [ ] Edit tag name
- [ ] Edit tag color
- [ ] Delete unused tag
- [ ] Delete used tag
- [ ] Search tags

**Document Integration:**
- [ ] Add tags to document
- [ ] Remove tags from document
- [ ] View tags in edit screen
- [ ] Save document with tags
- [ ] Multiple tags per document

**UI/UX:**
- [ ] Tag chips display correctly
- [ ] Tag picker modal works
- [ ] Color picker works
- [ ] Tag list scrolls smoothly
- [ ] Statistics display correctly

**Edge Cases:**
- [ ] Empty tag name validation
- [ ] Duplicate tag prevention
- [ ] Special characters in names
- [ ] Maximum tags per document
- [ ] Very long tag names

**Performance:**
- [ ] Large number of tags (100+)
- [ ] Many tags per document (20+)
- [ ] Fast search/filter
- [ ] Smooth scrolling

---

## Next Steps (Future Enhancements)

1. **Tag Filtering in Document List**
   - Filter documents by selected tags
   - Multi-tag filtering (AND/OR logic)
   - Quick filter buttons

2. **Tag-based Search**
   - Search documents by tag
   - Combine tag and text search

3. **Tag Auto-suggestions**
   - Suggest tags based on document content
   - Recently used tags
   - Popular tags

4. **Tag Analytics**
   - Tag usage over time
   - Most/least used tags
   - Tag relationship analysis

5. **Tag Import/Export**
   - Import tags from CSV
   - Export tag list
   - Share tags between users

---

## Testing Complete!

If all scenarios pass, the Tags feature is production-ready! 🎉

**Report any bugs or unexpected behavior for further refinement.**
