package com.scrumtracker.service;

import com.scrumtracker.entity.DailyUpdate;
import com.scrumtracker.entity.Sprint;
import com.scrumtracker.repository.DailyUpdateRepository;
import com.scrumtracker.repository.SprintRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelExportService {

    @Autowired private DailyUpdateRepository dailyUpdateRepository;
    @Autowired private SprintRepository sprintRepository;

    public byte[] exportSprintToExcel(Long sprintId) throws IOException {
        Sprint sprint = sprintRepository.findById(sprintId).orElseThrow();
        List<DailyUpdate> updates = dailyUpdateRepository.findBySprintOrderByUpdateDateDesc(sprint);

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sprint Updates");

        // Header style
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setColor(IndexedColors.WHITE.getIndex());
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);

        // Headers
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Date", "Member Name", "Username", "Today's Work",
                "Tomorrow's Plan", "Blockers", "Story Points", "Hours Worked"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data rows
        CellStyle altStyle = workbook.createCellStyle();
        altStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        altStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        int rowNum = 1;
        for (DailyUpdate update : updates) {
            Row row = sheet.createRow(rowNum);
            if (rowNum % 2 == 0) {
                for (int c = 0; c < headers.length; c++) row.createCell(c).setCellStyle(altStyle);
            }
            row.createCell(0).setCellValue(update.getUpdateDate().toString());
            row.createCell(1).setCellValue(update.getUser().getFullName());
            row.createCell(2).setCellValue(update.getUser().getUsername());
            row.createCell(3).setCellValue(update.getTodayWork() != null ? update.getTodayWork() : "");
            row.createCell(4).setCellValue(update.getTomorrowPlan() != null ? update.getTomorrowPlan() : "");
            row.createCell(5).setCellValue(update.getBlockers() != null ? update.getBlockers() : "");
            row.createCell(6).setCellValue(update.getStoryPointsLogged());
            row.createCell(7).setCellValue(update.getHoursWorked());
            rowNum++;
        }

        // Summary sheet
        Sheet summarySheet = workbook.createSheet("Summary");
        Row titleRow = summarySheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Sprint: " + sprint.getName());
        titleCell.setCellStyle(headerStyle);

        Row r1 = summarySheet.createRow(2);
        r1.createCell(0).setCellValue("Total Story Points:");
        r1.createCell(1).setCellValue(sprint.getTotalStoryPoints());
        Row r2 = summarySheet.createRow(3);
        r2.createCell(0).setCellValue("Hours per Story Point:");
        r2.createCell(1).setCellValue(sprint.getHoursPerStoryPoint());
        Row r3 = summarySheet.createRow(4);
        r3.createCell(0).setCellValue("Sprint Start:");
        r3.createCell(1).setCellValue(sprint.getStartDate().toString());
        Row r4 = summarySheet.createRow(5);
        r4.createCell(0).setCellValue("Sprint End:");
        r4.createCell(1).setCellValue(sprint.getEndDate().toString());

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
        summarySheet.autoSizeColumn(0);
        summarySheet.autoSizeColumn(1);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }
}
