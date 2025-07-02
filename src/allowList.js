// AuthProvider.jsx  (only the changed bits shown)

// 1️⃣  EXPORT the list so you can tweak it anywhere
export const ALLOWED_EMAILS = [
  "zhdhsn6@gmail.com",
  "zahid@zahid.com",
];

// ...

// 2️⃣  Helper – normalise both sides before comparing
const normalise = (str = "") => str.trim().toLowerCase();

const isAllowed = (firebaseUser) =>
  firebaseUser && ALLOWED_EMAILS.some(
    (e) => normalise(e) === normalise(firebaseUser.email)
  );

// rest of the file stays identical
