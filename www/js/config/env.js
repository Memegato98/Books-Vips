export const env = {
  firebase: window.VIPS_ENV?.firebase ?? {},
  demoMode: Boolean(window.VIPS_ENV?.demoMode),
  forcePasswordChangeClaim: window.VIPS_ENV?.forcePasswordChangeClaim ?? 'mustChangePassword',
  collections: {
    books: 'books', categories: 'categories', subjects: 'subjects', publicationTypes: 'publicationTypes', users: 'users', activity: 'activity'
  }
};
