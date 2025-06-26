package com.eventsphere.mapper;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class GenericMapper {

    public static <S, T> List<T> mapList(Collection<S> source, Function<S, T> mapper) {
        if (source == null) {
            return null;
        }
        
        return source.stream()
                .map(mapper)
                .collect(Collectors.toList());
    }

    public static <S, T> List<T> mapListFilterNull(Collection<S> source, Function<S, T> mapper) {
        if (source == null) {
            return null;
        }
        
        return source.stream()
                .map(mapper)
                .filter(item -> item != null)
                .collect(Collectors.toList());
    }

    public static <S, T> ArrayList<T> mapToArrayList(Collection<S> source, Function<S, T> mapper) {
        if (source == null) {
            return null;
        }
        
        return source.stream()
                .map(mapper)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    public static boolean isNotEmpty(String str) {
        return str != null && !str.trim().isEmpty();
    }

    public static String emptyIfNull(String str) {
        return str != null ? str : "";
    }

    public static String nullIfEmpty(String str) {
        return (str != null && !str.trim().isEmpty()) ? str : null;
    }

    public static <S, T> void copyNonNullProperties(S source, T target, 
            java.util.function.BiConsumer<S, T> mapper) {
        if (source != null && target != null) {
            mapper.accept(source, target);
        }
    }

    public static <S, T> T mapIfNotNull(S source, Function<S, T> mapper) {
        return source != null ? mapper.apply(source) : null;
    }

    @SafeVarargs
    public static <T> T firstNonNull(T... values) {
        for (T value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }
}
