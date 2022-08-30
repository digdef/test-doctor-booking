import { Logger } from '@nestjs/common';

// just a list of dummy mock examples
// keep this file for the testing reference

// feature, in real life should be an import
class FriendsList {
  friends = [];

  private logger = new Logger('Example Test');
  addFriend(name) {
    this.friends.push(name);
    this.announceFriendship(name);
  }

  announceFriendship(name) {
    this.logger.log(`${name} now is a friend`);
  }

  removeFriend(name) {
    const idx = this.friends.indexOf(name);

    if (idx === -1) {
      throw new Error('Friend is not found');
    }

    this.friends.splice(idx, 1);
  }
}

// tests
describe('Friends list test', () => {
  let friendsList;

  beforeEach(() => {
    friendsList = new FriendsList();
  });
  it('initialization friends list', () => {
    expect(friendsList.friends.length).toEqual(0);
  });

  it('add a friend', () => {
    friendsList.addFriend('John Doe');
    expect(friendsList.friends.length).toEqual(1);
  });

  it('announces a friendship', () => {
    const friendName = 'Janna Doe';
    friendsList.announceFriendship = jest.fn();

    expect(friendsList.announceFriendship).not.toHaveBeenCalled();
    friendsList.addFriend(friendName);
    expect(friendsList.announceFriendship).toHaveBeenCalledWith(friendName);
  });

  describe('removeFriend', () => {
    it('remove friend from the list', () => {
      const friendName = 'Janna Doe';
      friendsList.addFriend(friendName);

      expect(friendsList.friends[0]).toEqual(friendName);
      friendsList.removeFriend(friendName);
      expect(friendsList.friends[0]).toBeUndefined();
    });
    it('throws an error as friend is not exist', () => {
      expect(() => friendsList.removeFriend('Non-existing-name')).toThrow(
        new Error('Friend is not found'),
      );
    });
  });
});
