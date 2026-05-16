### Retrieval-Augmented Generation (RAG) Pattern

To handle large contracts with limited AI context windows, the system implements RAG using vector embeddings.

#### Workflow:
1. **Chunking**: Contracts are split into overlapping chunks (e.g., 1000 chars with 200 overlap).
2. **Embeddings**: Each chunk is converted into a vector using Gemini's embedding model.
3. **Persistence**: Vectors are stored in PostgreSQL using the `pgvector` extension.
4. **Retrieval**: When a user asks a question, a similarity search (`SearchSimilarChunks`) finds the most relevant context to send to the AI.