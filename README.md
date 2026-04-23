# StatWash — Excel Data Cleaning Tool

StatWash is a modern, privacy-first web application designed to clean, standardize, and export structured data from raw Excel sheets. **All processing happens locally on your machine** — no data ever leaves your browser.

## 🎯 Overview

StatWash automates the tedious process of data cleaning and validation. It intelligently detects file types, normalizes column names, validates data formats, identifies issues, and exports cleaned results—all with a user-friendly interface.

### Key Features

- 🔒 **Privacy-First**: 100% client-side processing. No data is sent to servers.
- 🤖 **Smart Detection**: Automatically identifies file types from headers.
- ✨ **Intelligent Cleaning**: Standardizes column names, normalizes dates, validates formats, removes duplicates, and applies transformations.
- 📋 **Template-Based**: Upload reference templates for each file type to guide cleaning rules.
- 📊 **Data Preview**: View original and cleaned data side-by-side with detailed issue reports.
- 💾 **Flexible Export**: Download cleaned data as Excel (.xlsx) or CSV (.csv) files.
- 🌓 **Dark Mode**: Light and dark theme support for comfortable use.

---

## 📁 Supported File Types

StatWash supports the following file types:

| File Type | Description |
|-----------|-------------|
| **Account Status BEL** | Account information with status, balance, and payment dates |
| **ADA Penalty** | Penalty records with violation details and amounts |
| **BSP Attestation** | Attestation records from the Bangko Sentral ng Pilipinas |
| **PTP Report BEL** | Payment-to-Payment (PTP) reports |
| **PTP Inventory BEL** | PTP inventory records |
| **Cards Attendance** | Card-based attendance logs |
| **Field Visit Report BEL** | Field visit records and reports |

---

## 🚀 Getting Started

### Access the Application

StatWash is a web application. Simply open it in your browser to get started.

### Application Structure

The app is organized into four main sections accessible from the left sidebar:

1. **Settings** — Manage templates
2. **Cleaning** — Upload and clean files
3. **Data Viewing** — Review and export results
4. **Editing** — Make manual adjustments (if needed)

---

## 📋 Complete Workflow: Template Upload → Data Import → Data Export

### Step 1: Set Up Templates (Settings Page)

Templates are reference files that define the expected structure and cleaning rules for each file type.

#### How to Upload a Template:

1. Navigate to the **Settings** page from the sidebar
2. Select a file type from the list of supported types
3. Click **Upload Template** for the selected file type
4. Choose a clean, well-formatted Excel file as your reference:
   - Should contain proper column headers
   - Should have a few sample rows (optional but recommended)
   - This file serves as the "golden standard" for your data type
5. The template is saved locally in your browser's storage (IndexedDB)
6. A confirmation message appears showing:
   - File name
   - Number of columns detected
   - Number of sample rows included
   - Upload timestamp

#### What Happens When You Upload a Template:

- **Column Detection**: StatWash reads the column headers from your template
- **Storage**: The template is stored locally in your browser (not on any server)
- **Reusability**: Once uploaded, the template is used for all future files of that type
- **One Per Type**: Each file type can have exactly one active template

#### Template Best Practices:

- Use well-structured Excel files with clear column headers
- Ensure headers match your organization's naming conventions
- Include at least 2-3 sample rows to help with format detection
- Keep templates up-to-date as your data structure evolves
- Delete old templates before uploading new ones if you want to replace them

---

### Step 2: Clean Your Data (Cleaning Page)

Once templates are set up, you can upload data files to be cleaned.

#### How to Upload and Clean a File:

1. Navigate to the **Cleaning** page
2. Select a specific file type using the file type buttons/tabs
   - The page displays information about the selected file type
   - Shows whether a template exists for this type
3. Upload your Excel file by:
   - Dragging and dropping into the upload zone, or
   - Clicking the upload area to browse for a file
4. StatWash automatically:
   - **Detects the file type** from headers (you can verify or change this)
   - **Normalizes column names** based on your template
   - **Validates data** against expected formats
   - **Identifies issues** (missing values, invalid formats, duplicates, type mismatches)
   - **Applies transformations** (date normalization, casing, trimming, type conversion)
   - **Generates a summary** with statistics

#### What StatWash Does During Cleaning:

| Operation | Description |
|-----------|-------------|
| **Column Normalization** | Maps raw headers to standard canonical names |
| **Data Validation** | Checks for required fields, valid formats, and data types |
| **Date Formatting** | Converts various date formats to standardized YYYY-MM-DD |
| **Numeric Validation** | Ensures numeric columns contain valid numbers |
| **Duplicate Detection** | Identifies and flags duplicate rows |
| **Casing Rules** | Applies text casing (UPPER, Title, lower) per column |
| **Trimming** | Removes leading/trailing whitespace |
| **Type Conversion** | Converts data to correct types where possible |

#### Viewing Cleaning Results:

- **Original Data**: See the raw data exactly as uploaded
- **Cleaned Data**: View the normalized, validated data
- **Issues Panel**: See a detailed list of all detected problems:
  - **Errors**: Critical issues that must be fixed
  - **Warnings**: Non-critical issues to review
  - **Info**: Informational messages
- **Transformation Log**: View all automatic transformations applied
- **Summary Statistics**: Total rows, clean rows, warning rows, error rows, duplicates removed, etc.

#### Multiple Files:

- You can upload multiple files of the same or different types
- Each file appears as a tab
- Switch between files easily
- Process all files simultaneously

---

### Step 3: Review and Export Data (Data Viewing Page)

After cleaning, review your results and export the data in your preferred format.

#### How to Export Your Cleaned Data:

1. Navigate to the **Data Viewing** page (or it may auto-appear after cleaning)
2. Review the cleaned data in the grid view
3. Check the **Issues Panel** on the right side for any problems
4. Click the **Export** button and choose a format:
   - **Excel (.xlsx)**: Recommended for most use cases
     - Preserves formatting
     - Auto-sized columns for readability
     - Compatible with Excel, Google Sheets, etc.
   - **CSV (.csv)**: For import to databases or other tools
     - Plain text format
     - Universal compatibility
     - Lightweight file size

#### Export Details:

- Files are automatically named: `{original_filename}_cleaned.{extension}`
- Downloaded directly to your computer (no cloud upload)
- Column widths are auto-sized (Excel export only)
- All data transformations are included in the export
- Original file remains unchanged

#### What to Do With Issues:

- **Red/Error Issues**: Must be resolved before trusting the data
  - Manually correct in the source file and re-upload, or
  - Use the **Editing page** to make corrections in StatWash
- **Yellow/Warning Issues**: Review and decide if action is needed
  - May be acceptable depending on your use case
  - Document any decisions for audit trails
- **Blue/Info Issues**: Informational only
  - Shows what transformations were applied
  - Useful for understanding data changes

---

## 🎓 Understanding the Cleaning Process

### File Type Detection

StatWash uses intelligent detection to identify file types:

1. **Header Signature Matching**: Looks for key words in column headers
2. **Column Name Matching**: Checks for known column patterns
3. **Scoring System**: Assigns scores based on matches
4. **Manual Override**: You can always select a different file type if auto-detection is wrong

### Cleaning Rules

Each file type has specific cleaning rules:

- **Expected Columns**: The standard columns for this file type
- **Required Fields**: Columns that must have values
- **Date Columns**: Which columns contain dates and how to format them
- **Numeric Columns**: Which columns should contain numbers
- **Casing Rules**: How text should be capitalized in each column
- **Column Mapping**: How raw headers map to standard names

### Issue Types

StatWash categorizes issues by type:

| Issue Type | Meaning | Example |
|-----------|---------|---------|
| **missing** | Required field is empty | Account Number is blank |
| **invalid_format** | Data doesn't match expected format | Date in wrong format |
| **duplicate** | Row is a duplicate of another | Same account info twice |
| **type_mismatch** | Data type is wrong | Text in numeric column |

### Transformations

The app logs all automatic transformations for transparency:

- **normalize_column**: Column header was standardized
- **fix_date**: Date was converted to standard format
- **fix_casing**: Text casing was corrected
- **remove_duplicate**: Duplicate row was removed
- **fill_default**: Missing value was filled with default
- **trim_whitespace**: Leading/trailing spaces removed
- **convert_type**: Data type was converted

---

## 🛠️ Technical Architecture

### Technology Stack

- **Frontend Framework**: Next.js 16.1.6 with React 19.2.3
- **Styling**: Tailwind CSS with custom components
- **Data Grid**: AG Grid (community edition)
- **Data Export**: XLSX library for Excel support
- **Local Storage**: IndexedDB for template persistence
- **UI Components**: Radix UI primitive components
- **Theme Support**: next-themes for dark mode
- **Icons**: Lucide React

### How It Works

1. **Browser-Only Processing**: All operations run in your browser using JavaScript
2. **No Server Communication**: Data never leaves your machine
3. **IndexedDB Storage**: Templates are stored locally for quick access
4. **Automatic Detection**: Machine learning-style pattern matching identifies file types
5. **Streaming Processing**: Large files are processed efficiently in memory

### Privacy & Security

- ✅ No data transmitted to servers
- ✅ No cookies or tracking
- ✅ No external API calls with your data
- ✅ Templates stored only in your browser
- ✅ Clear browser storage to delete all local data

---

## 🎯 Best Practices

### For Template Management

1. **Create templates once** — Set up templates for each file type you use
2. **Keep them current** — Update templates when data structure changes
3. **Use clean data** — Templates should be well-formatted reference files
4. **Document structure** — Keep notes on what each column represents

### For Data Cleaning

1. **Review the summary first** — Check for high error counts
2. **Check error issues** — Address all errors before export
3. **Verify transformations** — Review the transformation log
4. **Test the export** — Open exported files to verify they're correct
5. **Keep original files** — Don't delete source files until you verify exports

### For File Export

1. **Choose Excel for complex data** — Better for data analysis
2. **Use CSV for integrations** — Better for database imports
3. **Name files descriptively** — Include dates or version numbers
4. **Archive cleaned data** — Keep exports organized for audit trails
5. **Document your process** — Note which template and date cleaning occurred

---

## 🆘 Troubleshooting

### "File type not detected"

**Problem**: StatWash can't identify your file type automatically.

**Solutions**:
- Ensure column headers match standard naming conventions
- Check that headers are in the first row
- Manually select the file type from the list
- Upload a template for better detection

### "Template not found"

**Problem**: You're trying to clean a file type but no template is set up.

**Solutions**:
- Go to Settings and upload a template for that file type
- Templates are file-type-specific, not universal
- Each file type needs its own template

### "High number of errors in cleaned data"

**Problem**: Too many issues detected during cleaning.

**Solutions**:
- Check if file type detection is correct
- Verify source data quality
- Review error details to identify patterns
- Update your template if data structure changed
- May indicate inconsistent source data

### "Export file is empty or corrupted"

**Problem**: Downloaded file won't open or contains no data.

**Solutions**:
- Try exporting again
- Try different format (Excel vs. CSV)
- Check browser download folder
- Verify no errors were preventing export
- Try with a smaller file first

### "Templates disappeared"

**Problem**: Previously uploaded templates are gone.

**Solutions**:
- Check if you cleared browser data/cache
- Templates are stored in IndexedDB (browser storage)
- Clearing browser data permanently deletes templates
- Re-upload templates if needed
- Consider regular backups of important templates

---

## 📊 Example Workflow

Here's a complete example of how to use StatWash:

### Scenario: Cleaning Account Status Files

#### Week 1: Setup

1. Go to **Settings**
2. Select "Account Status BEL"
3. Upload a well-formatted account status Excel file as template
4. Confirm template is saved

#### Week 2: Process New Data

1. Go to **Cleaning** → Select "Account Status BEL"
2. Upload your raw account data file
3. Review the cleaning summary
4. Check issues panel for any errors
5. If clean, proceed to export

#### Week 3: Export and Use

1. Go to **Data Viewing**
2. Review cleaned data grid
3. Click **Export** → Choose **Excel**
4. Save file to your computer
5. Use cleaned data for reporting or analysis

---

## 🚀 Quick Start Guide

### 5-Minute Setup

1. **Open StatWash** → You're already in the app
2. **Go to Settings** → Upload a template for your file type
3. **Go to Cleaning** → Upload a data file
4. **Wait for processing** → Review the cleaning summary
5. **Go to Data Viewing** → Export your cleaned data

### First File Checklist

- [ ] Template uploaded for file type
- [ ] Data file uploaded successfully
- [ ] File type correctly detected
- [ ] Cleaning summary reviewed
- [ ] No critical errors found
- [ ] Data exported to desired format
- [ ] Export file opened and verified

---

## 📝 Version Information

- **Version**: 1.0.0
- **Framework**: Next.js 16.1.6
- **React**: 19.2.3
- **Node Version**: Requires Node.js 18+

---

## 🤝 Support

For issues, questions, or feedback:

1. **Check the Troubleshooting section** above
2. **Review file type configuration** to ensure correct setup
3. **Verify template quality** — templates directly affect cleaning quality
4. **Test with sample data** — use known-good files first

---

## 📋 FAQ

**Q: Is my data stored on a server?**  
A: No. All processing and storage happens in your browser only.

**Q: Can I use this offline?**  
A: Yes! Once loaded, StatWash works offline. Templates are stored locally.

**Q: What file formats are supported?**  
A: Currently Excel (.xlsx, .xls) and CSV files.

**Q: Can I process multiple files at once?**  
A: Yes. Upload multiple files and switch between them using tabs.

**Q: What happens to my templates if I close the browser?**  
A: They're saved in browser storage (IndexedDB) and will persist.

**Q: Can I edit data after cleaning?**  
A: Yes. Use the Editing page to make manual adjustments.

**Q: How do I delete a template?**  
A: Go to Settings, find the file type, and click the delete/remove button.

**Q: Can I switch file types mid-clean?**  
A: Yes. Go to Cleaning and select a different file type. Your current file will be reset.

**Q: What's the maximum file size?**  
A: Depends on your browser memory, typically 100MB+ files work fine.

**Q: How accurate is file type detection?**  
A: Very accurate if headers match conventions. Manual selection available if needed.

---

## 🎨 Features Overview

### Settings Page
- Upload and manage templates per file type
- View template details (columns, sample rows, upload date)
- Delete templates when needed
- Track template versions

### Cleaning Page
- File type selection with descriptions
- Drag-and-drop file upload
- Real-time file type detection
- Cleaning progress indicator
- Detailed issue reporting

### Data Viewing Page
- Side-by-side original vs. cleaned data
- Interactive data grid with sorting/filtering
- Issues panel with severity indicators
- Transformation log
- Cleaning summary statistics
- Export options (Excel/CSV)

### Editing Page
- Make manual corrections to cleaned data
- Cell-by-cell editing
- Undo/redo support
- Bulk operations

---

## 📚 Understanding Your Data

### Column Names

StatWash normalizes column names to standard formats:
- Raw headers are mapped to canonical names
- Variations are automatically recognized (e.g., "Acct No" → "Account Number")
- Helps with consistency across different source files

### Date Formats

The app intelligently handles multiple date formats:
- Converts to ISO standard format: `YYYY-MM-DD`
- Recognizes: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
- Validates dates are within reasonable range (1900-2100)

### Numeric Columns

Numbers are validated and preserved:
- Non-numeric values in numeric columns are flagged as errors
- Whitespace is trimmed
- Negative numbers and decimals are supported

### Text Casing

Text is standardized based on column rules:
- **UPPERCASE**: For codes and identifiers
- **Title Case**: For names and descriptions
- **lowercase**: For codes that should be lowercase
- **none**: Leave unchanged

---

## 🔄 Data Flow Diagram

```
Upload File
    ↓
Detect File Type (Header Analysis)
    ↓
Normalize Columns (Map Headers)
    ↓
Validate Data (Check Formats, Required Fields)
    ↓
Apply Transformations (Dates, Casing, Type Conversion)
    ↓
Identify Issues (Errors, Warnings, Info)
    ↓
Generate Summary (Statistics & Logs)
    ↓
Display Results (Original vs. Cleaned)
    ↓
Export (Excel or CSV Download)
```

---

**Made with ❤️ for better data quality. All processing happens locally — your data is always private.**
