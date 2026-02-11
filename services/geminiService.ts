// Stub — word generation is handled by the Go backend.
// This file is kept so mockSocket.ts can still import it without errors.

export const generateSecretWord = async (): Promise<string> => {
  const words = ["Moon", "Silver", "Forest", "Castle", "Mirror", "Wolf", "Village", "Puppy", "Garden", "Ocean"];
  return words[Math.floor(Math.random() * words.length)];
};
