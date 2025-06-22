# Page snapshot

```yaml
- banner:
  - heading "Grammar Anatomy Interactive" [level=1]
  - navigation:
    - link "Login":
      - /url: /login
    - link "Register":
      - /url: /register
    - button "Toggle dark mode": Dark Mode
- main:
  - heading "Register" [level=2]
  - text: Name
  - textbox "Name": Test User
  - text: Email
  - textbox "Email": testuser1750608664457@example.com
  - text: Password
  - textbox "Password": short
  - text: Confirm Password
  - textbox "Confirm Password": short
  - text: Network error
  - button "Register"
  - link "Back to Login":
    - /url: /login
```