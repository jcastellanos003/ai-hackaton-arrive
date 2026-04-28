package com.buymore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private List<CategoryItem> data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryItem {
        private String name;
        private Long count;
    }
}
