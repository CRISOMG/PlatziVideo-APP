import gravatar from '../../utils/gravatar';

test('gravatar', () => {
  const email = 'caraballodev@gmail.com';
  const gravatarUrl =
    'https://gravatar.com/avatar/288648f276373803a472a159a8ad4f31';
  expect(gravatarUrl).toEqual(gravatar(email));
});
