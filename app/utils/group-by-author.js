import { excludedBots } from './excluded-bots';

export const groupByAuthor = (data, defaultArray) => {
  const groupedAuthors = data.reduce((items, item) => {
    const authorLogin = item.author?.login;
    const authorName = item.commit.author.name;
    const authorUrl = item.author?.html_url;
    const authorAvatar = item.author?.avatar_url;

    if (!excludedBots.includes(authorLogin)) {
      if (!items[authorLogin]) {
        items[authorLogin] = {
          name: authorName,
          login: `@${authorLogin}`,
          url: authorUrl,
          avatar: authorAvatar,
          count: 1,
        };
      } else {
        items[authorLogin].count += 1;
      }
    }

    return items;
  }, {});

  const authors = Object.values(groupedAuthors);

  const result = [...authors, ...defaultArray].sort((a, b) => b.count - a.count);

  return result;
};
