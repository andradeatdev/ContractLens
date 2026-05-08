package services

// EmailSender define a interface para envio de e-mails (Port)
type EmailSender interface {
	SendVerificationEmail(email, name, token string) error
}
