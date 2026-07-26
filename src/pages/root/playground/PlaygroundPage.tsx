import { Fragment } from "react";
import {
  Article,
  ArticleContent,
  ArticleNavigationSidebar,
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
  ArticleParagraphSeparator,
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
  type ArticleNavigationItem,
} from "@/components/commons/Article/Article";

type PlaygroundArticle = ArticleNavigationItem & {
  eyebrow: string;
};

const articleItems: PlaygroundArticle[] = [
  {
    id: "profile",
    title: "Profile",
    eyebrow: "Account settings",
    description:
      "Manage the identity details that appear wherever you collaborate.",
    weight: 2,
    children: [
      {
        id: "profile-avatar",
        title: "Avatar",
        description: "Your visual identifier in shared spaces.",
        weight: 1,
      },
      {
        id: "profile-display-name",
        title: "Display name",
        description: "The name shown to collaborators.",
        weight: 2,
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    eyebrow: "Account settings",
    description:
      "Sign-in safeguards and the recovery options for your account.",
    weight: 4,
    children: [
      {
        id: "security-password",
        title: "Password",
        description: "Update the credential used to sign in.",
        weight: 2,
      },
      {
        id: "security-two-factor",
        title: "Two-factor authentication",
        description: "Add a second verification step.",
        weight: 3,
      },
      {
        id: "security-recovery",
        title: "Recovery methods",
        description: "Keep a fallback path to your account.",
        weight: 2,
      },
    ],
  },
  {
    id: "appearance",
    title: "Appearance",
    eyebrow: "Preferences",
    description: "The visual defaults that shape your everyday workspace.",
    weight: 5,
    children: [
      {
        id: "appearance-theme",
        title: "Theme",
        description: "Set the overall light or dark presentation.",
        weight: 2,
      },
      {
        id: "appearance-density",
        title: "Display density",
        description: "Control the spacing between interface elements.",
        weight: 3,
      },
      {
        id: "appearance-editor",
        title: "Editor preferences",
        description: "Tune the writing surface to your workflow.",
        weight: 3,
        children: [
          {
            id: "appearance-editor-motion",
            title: "Reduced motion",
            description: "Limit non-essential interface animation.",
            weight: 1,
          },
        ],
      },
    ],
  },
];

const ArticleSubsections = ({ items }: { items: ArticleNavigationItem[] }) => (
  <>
    {items.map(item => (
      <ArticleSubParagraph key={item.id} id={item.id}>
        <ArticleSubParagraphHeader className="text-foreground">
          {item.title}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent className="text-muted-foreground">
          <p>{item.description}</p>
          {item.children && item.children.length > 0 && (
            <ArticleSubsections items={item.children} />
          )}
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
    ))}
  </>
);

const PlaygroundArticleParagraph = ({ item }: { item: PlaygroundArticle }) => (
  <ArticleParagraph id={item.id}>
    <ArticleParagraphHeader>
      <p className="text-sm font-medium text-muted-foreground">
        {item.eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {item.title}
      </h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">
        {item.description}
      </p>
    </ArticleParagraphHeader>
    <ArticleParagraphContent>
      {item.children && <ArticleSubsections items={item.children} />}
    </ArticleParagraphContent>
  </ArticleParagraph>
);

const PlaygroundPage = () => {
  return (
    <div className="h-full min-h-0 bg-canvas px-4 py-6 sm:px-6 lg:px-3">
      <Article>
        <ArticleNavigationSidebar items={articleItems} />
        <ArticleContent>
          {articleItems.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 && <ArticleParagraphSeparator />}
              <PlaygroundArticleParagraph item={item} />
            </Fragment>
          ))}
        </ArticleContent>
      </Article>
    </div>
  );
};

export default PlaygroundPage;
