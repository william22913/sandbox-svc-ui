import { describe, expect, it } from 'vitest';
import { isLimitReached, isNotFound, isUnauthorized } from './redirectToLogin';

describe('error mapping', () => {
  it('maps 401 to the login redirect (REQ-006)', () => {
    expect(isUnauthorized({ response: { status: 401 } })).toBe(true);
    expect(isUnauthorized({ response: { status: 404 } })).toBe(false);
  });

  it('maps 422 FAVORITES_LIMIT_REACHED to the inline cap error (REQ-011)', () => {
    expect(
      isLimitReached({
        response: { status: 422, data: { error_code: 'FAVORITES_LIMIT_REACHED' } },
      })
    ).toBe(true);
    expect(isLimitReached({ response: { status: 422, data: { error_code: 'OTHER' } } })).toBe(false);
  });

  it('maps 404 to the generic row error (REQ-008)', () => {
    expect(isNotFound({ response: { status: 404 } })).toBe(true);
    expect(isNotFound({ response: { status: 500 } })).toBe(false);
  });
});
