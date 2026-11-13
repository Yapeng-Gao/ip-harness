# expert-avatars

Photo-style placeholder portraits for `ExpertAvatar`.

- Source: [randomuser.me](https://randomuser.me) public portrait placeholders (`/api/portraits/{men|women}/N.jpg`)
- Vendored locally so the UI does not depend on that CDN at runtime
- Selection: FNV-1a hash of role name → `hash % 23` → `00.jpg`…`22.jpg` (stable per role)
- Not real employee photos; placeholder only
