import type { FC } from "hono/jsx"
import type { Style } from "./utility.types";
import type { Tag } from "./service.tag";
import { Fragment, useContext } from "hono/jsx";
import { TagsContext } from "./page.dashboard";

type InlineJS = (event: MouseEvent) => void

const TagLink: FC<{tag: Tag}> = (props) => {
  const { color } = props.tag
  const style: Style = {
    color: color ? color : "initial",
    backgroundColor: color ? `${color}30` : "var(--pico-background-color)",
    border: "solid 1px " + (color ? color : "var(--pico-border-color)"),
    borderRadius: "1.25em",
    padding: "0.25rem 0.75rem",
    textDecorationLine: "none",
  };
  const href = "?tag=" + props.tag.name
  return <a
    href={href}
    style={style as unknown as string}
    onMouseOver={"this.style.textDecoration='underline'" as unknown as InlineJS}
    onMouseOut={"this.style.textDecoration='none'" as unknown as InlineJS}
    >
      {props.tag.name}
    </a>
}

const tabStyle: Style = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--pico-form-element-spacing-horizontal) var(--pico-form-element-spacing-vertical)",
  paddingBottom: "0.75rem",
}

export const Tabs: FC = ({ children }) => {
    const tags = useContext(TagsContext)
    const TagsLinks = tags.map(tag => <TagLink tag={tag}/>)
    return (
      <Fragment>
        <div style={tabStyle as unknown as string}>
          {TagsLinks}
        </div>
        {children}
      </Fragment>
    );
}
