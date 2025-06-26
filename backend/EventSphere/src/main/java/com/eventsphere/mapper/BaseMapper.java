package com.eventsphere.mapper;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Component
public abstract class BaseMapper {
    

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    protected LocalDate stringToLocalDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(dateString, DATE_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }
    
    protected String localDateToString(LocalDate date) {
        if (date == null) {
            return null;
        }
        try {
            return date.format(DATE_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    protected LocalTime stringToLocalTime(String timeString) {
        if (timeString == null || timeString.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalTime.parse(timeString, TIME_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    protected String localTimeToString(LocalTime time) {
        if (time == null) {
            return null;
        }
        try {
            return time.format(TIME_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    protected LocalDateTime stringToLocalDateTime(String dateTimeString) {
        if (dateTimeString == null || dateTimeString.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDateTime.parse(dateTimeString, DATETIME_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    protected String localDateTimeToString(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        try {
            return dateTime.format(DATETIME_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    protected boolean hasText(String str) {
        return str != null && !str.trim().isEmpty();
    }

    protected String getOrDefault(String str, String defaultValue) {
        return hasText(str) ? str : defaultValue;
    }

    protected <T, R> List<R> mapList(List<T> list, java.util.function.Function<T, R> mapper) {
        if (list == null) {
            return null;
        }
        return list.stream()
                   .map(mapper)
                   .collect(Collectors.toList());
    }
}