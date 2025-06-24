# Page snapshot

```yaml
- banner:
  - link "Grammar Anatomy Interactive":
    - /url: /login
  - navigation:
    - link "Login":
      - /url: /login
    - link "Register":
      - /url: /register
    - button "Toggle dark mode": Dark Mode
- main:
  - heading "Login" [level=2]
  - text: Email
  - textbox "Email"
  - text: Password
  - textbox "Password"
  - button "Login"
  - link "Register":
    - /url: /register
  - link "Forgot password?":
    - /url: /reset-password
- iframe
```