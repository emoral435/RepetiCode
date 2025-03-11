/* AuthTypes is an enumeration to indicate which authentication type is used */
enum AuthTypes {
	EMAIL_PASSWORD,
  GOOGLE,
  GITHUB,
}

enum AuthProviderEmails {
  GOOGLE = "google.com",
  GITHUB = "github.com",
}

export {
  AuthTypes,
  AuthProviderEmails,
};