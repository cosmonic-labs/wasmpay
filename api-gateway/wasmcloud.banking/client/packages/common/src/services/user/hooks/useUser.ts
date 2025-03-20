const USER_DATA = {
  username: 'lskywalker',
  email: 'luke@larsmoisturefarm.space',
  name: {
    first: 'Luke',
    last: 'Skywalker',
  },
  avatar: '/images/luke.png',
};

interface User {
  login: string;
  avatar_url: string;
  name: string;
}
