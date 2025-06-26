package com.eventsphere.dto;

public class UserDisplayDTO {
    
    private Long id;
    private String username;
    private String name;
    private String photo;

    public UserDisplayDTO() {}

    public UserDisplayDTO(Long id, String username, String name, String photo) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.photo = photo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }
}
