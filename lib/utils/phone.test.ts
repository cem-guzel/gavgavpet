import { describe, it, expect } from 'vitest';
import { formatTurkishPhone } from './phone';

describe('formatTurkishPhone', () => {
   it('0 ile başlayan boşluklu numarayı doğru formatlar', () => {
    // Arrange
    const input = '0536 899 43 74';

    // Act
    const result = formatTurkishPhone(input);

    // Assert
    expect(result).toBe('+905368994374');
  });
    it('+90 ile başlayan numarayı olduğu gibi formatlar', () => {
    // Arrange
    const input = '+90 536 899 43 74';

    // Act
    const result = formatTurkishPhone(input);

    // Assert
    expect(result).toBe('+905368994374');
  });
   it('başında 0 veya 90 olmayan 10 haneli numarayı formatlar', () => {
    // Arrange
    const input = '536 899 43 74';

    // Act
    const result = formatTurkishPhone(input);

    // Assert
    expect(result).toBe('+905368994374');
  });
  it('geçersiz bir numara verildiğinde hata fırlatır', () => {
    // Arrange
    const input = '123';

    // Act & Assert
    expect(() => formatTurkishPhone(input)).toThrow('Geçersiz telefon numarası formatı');
  });
});