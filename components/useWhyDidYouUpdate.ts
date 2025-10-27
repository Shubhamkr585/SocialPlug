import { useEffect, useRef } from "react";

type Props = Record<string, any>;

export function useWhyDidYouUpdate(name: string, props: Props) {
  const previousProps = useRef<Props | undefined>(undefined);

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changesObj: Record<string, { from: any; to: any }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current && previousProps.current[key] !== props[key]) {
          changesObj[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changesObj).length) {
        console.log("[Why Did You Update?]", name, changesObj);
      }
    }

    previousProps.current = props;
  });
}