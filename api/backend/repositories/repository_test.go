package repositories

import (
	"testing"

	"github.com/andradeatdev/ContractLens/api/backend/models"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupRepoTest(t *testing.T) (Repository, *gorm.DB) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to test database: %v", err)
	}

	_ = db.AutoMigrate(&models.User{}, &models.Contract{}, &models.Risk{}, &models.ChatMessage{}, &models.Note{})
	return NewGormRepository(db), db
}

func TestUserRepo(t *testing.T) {
	repo, _ := setupRepoTest(t)

	t.Run("Create and Get User", func(t *testing.T) {
		user := &models.User{Name: "Repo User", Email: "repo@example.com"}
		err := repo.CreateUser(user)
		assert.NoError(t, err)

		found, err := repo.GetUserByEmail("repo@example.com")
		assert.NoError(t, err)
		assert.Equal(t, "Repo User", found.Name)
	})
}

func TestContractRepo(t *testing.T) {
	repo, _ := setupRepoTest(t)
	user := &models.User{Name: "User", Email: "u@ex.com"}
	_ = repo.CreateUser(user)

	t.Run("Create and List", func(t *testing.T) {
		c := &models.Contract{UserID: user.ID, Filename: "test.pdf", Slug: "test-pdf"}
		err := repo.Create(c)
		assert.NoError(t, err)

		list, err := repo.List(user.ID)
		assert.NoError(t, err)
		assert.Len(t, list, 1)
	})
}
