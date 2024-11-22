import { describe, expect, it } from 'vitest';
import { SubjectBase } from '../modules/subject-base';

// Create a concrete test implementation
class TestSubject extends SubjectBase<{
  userId: string;
  action: string;
}> {
  protected format = 'users.{user_id}.{action}';
}

describe('SubjectBase', () => {
  describe('parse', () => {
    it('should format fields according to the format string', () => {
      const subject = new TestSubject({
        userId: '123',
        action: 'update',
      });

      expect(subject.parse()).toBe('users.123.update');
    });

    it('should use wildcards (*) for undefined fields', () => {
      const subject = new TestSubject({
        userId: '123',
      });

      expect(subject.parse()).toBe('users.123.*');
    });

    it('should handle empty fields object', () => {
      const subject = new TestSubject();

      expect(subject.parse()).toBe('users.*.*');
    });
  });

  describe('build', () => {
    it('should merge new fields with existing ones', () => {
      const subject = new TestSubject({ userId: '123' });
      subject.build({ action: 'delete' });

      expect(subject.parse()).toBe('users.123.delete');
    });

    it('should override existing fields', () => {
      const subject = new TestSubject({ userId: '123', action: 'create' });
      subject.build({ action: 'update' });

      expect(subject.parse()).toBe('users.123.update');
    });
  });

  describe('static build', () => {
    it('should create and build instance in one step', () => {
      const subject = TestSubject.build({
        userId: '123',
        action: 'create',
      });

      expect(subject.parse()).toBe('users.123.create');
    });

    it('should handle empty fields', () => {
      const subject = TestSubject.build();

      expect(subject.parse()).toBe('users.*.*');
    });
  });

  describe('static wildcard', () => {
    it('should return parsed string with all wildcards', () => {
      const result = TestSubject.wildcard();

      expect(result).toBe('users.*.*');
    });
  });
});
