import { ICONS } from "@/lib/icons";
import { ConfigItem } from "mogh_ui";
import { ActionIcon, Button, Group, TextInput } from "@mantine/core";

const LINK_SEPARATOR = " | ";

function sanitizeLinkUrl(url: string) {
  return url.replaceAll("|", "").trim();
}

export function parseResourceLink(raw: string): {
  url: string;
  label?: string;
} {
  const trimmed = raw.trim();
  const spaced = trimmed.lastIndexOf(LINK_SEPARATOR);
  if (spaced > 0) {
    const label = trimmed.slice(0, spaced).trim();
    const url = sanitizeLinkUrl(
      trimmed.slice(spaced + LINK_SEPARATOR.length),
    );
    if (label) return { url, label };
  }
  const pipe = trimmed.lastIndexOf("|");
  if (pipe > 0) {
    const label = trimmed.slice(0, pipe).trim();
    const url = sanitizeLinkUrl(trimmed.slice(pipe + 1));
    if (label && url && /:\/\//.test(url)) return { url, label };
  }
  return { url: sanitizeLinkUrl(trimmed) };
}

export function formatResourceLink(url: string, label?: string) {
  const trimmedUrl = sanitizeLinkUrl(url);
  const trimmedLabel = label?.trim() ?? "";
  if (!trimmedLabel) return trimmedUrl;
  return `${trimmedLabel}${LINK_SEPARATOR}${trimmedUrl}`;
}

export default function ConfigLinks<T extends { links?: string[] }>({
  values,
  set,
  disabled,
}: {
  values: string[];
  set: (update: Partial<T>) => void;
  disabled?: boolean;
}) {
  const updateAt = (index: number, url: string, label?: string) => {
    set({
      links: values.map((value, i) =>
        i === index ? formatResourceLink(url, label) : value,
      ),
    } as Partial<T>);
  };

  return (
    <ConfigItem
      label="Links"
      description="Add quick links in the resource header. An optional label is shown instead of the URL."
    >
      {values.map((value, i) => {
        const { url, label } = parseResourceLink(value);
        return (
          <Group key={i} gap="xs" wrap="nowrap">
            <TextInput
              value={url}
              onChange={(e) => updateAt(i, e.target.value, label)}
              disabled={disabled}
              placeholder="Input link"
              w={{ base: 160, md: 250, lg: 400 }}
            />
            <TextInput
              value={label ?? ""}
              onChange={(e) => updateAt(i, url, e.target.value)}
              disabled={disabled}
              placeholder="Label"
              w={{ base: 90, md: 140 }}
            />
            {!disabled && (
              <ActionIcon
                variant="filled"
                color="red"
                onClick={() =>
                  set({
                    links: values.filter((_, idx) => idx !== i),
                  } as Partial<T>)
                }
              >
                <ICONS.Remove size="1rem" />
              </ActionIcon>
            )}
          </Group>
        );
      })}
      {!disabled && (
        <Button
          leftSection={<ICONS.Add size="1rem" />}
          onClick={() =>
            set({
              links: [...values, ""],
            } as Partial<T>)
          }
          w={{ base: "85%", lg: 400 }}
          disabled={disabled}
        >
          Add Link
        </Button>
      )}
    </ConfigItem>
  );
}
