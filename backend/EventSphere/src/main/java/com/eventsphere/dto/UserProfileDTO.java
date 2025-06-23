package com.eventsphere.dto;

public class UserProfileDTO {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String photo;

    public UserProfileDTO(Long id, String username, String name, String email, String photo) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.email = email;
        this.photo = photo;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhoto() { return photo; }

    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPhoto(String photo) { this.photo = photo; }
}
