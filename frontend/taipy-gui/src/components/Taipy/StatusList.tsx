/*
 * Copyright 2021-2025 Avaiga Private Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import React, { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import Tooltip from "@mui/material/Tooltip";
import Popover, { PopoverOrigin } from "@mui/material/Popover";

import Status, { StatusType } from "./Status";
import { getSuffixedClassNames, TaipyBaseProps, TaipyHoverProps } from "./utils";
import { useClassNames, useDynamicProperty } from "../../utils/hooks";
import { getComponentClassName } from "./TaipyStyle";

export const getStatusIntValue = (status: string) => {
    status = status.toLowerCase();
    if (status.startsWith("i")) {
        return 0;
    } else if (status.startsWith("s")) {
        return 1;
    } else if (status.startsWith("w")) {
        return 2;
    } else if (status.startsWith("e")) {
        return 3;
    }
    return -1;
};

export const getStatusStrValue = (status: number) => {
    switch (status) {
        case 0:
            return "info";
        case 1:
            return "success";
        case 2:
            return "warning";
        case 3:
            return "error";
        default:
            return "unknown";
    }
};

const getId = (base: string | undefined, idx: number) => (base || "status") + idx;

const NO_STATUS = { status: "info", message: "No Status" };

const getGlobalStatus = (values: StatusDel[]) => {
    values = values.filter((val) => !val.hidden);
    if (values.length == 0) {
        return NO_STATUS;
    } else if (values.length == 1) {
        return values[0];
    } else {
        const status = values.reduce((prevVal, currentStatus) => {
            const newVal = getStatusIntValue(currentStatus.status);
            return prevVal > newVal ? prevVal : newVal;
        }, 0);
        return { status: getStatusStrValue(status), message: `${values.length} statuses` };
    }
};

const statusEqual = (v1: StatusDel, v2: StatusDel) => v1.status === v2.status && v1.message === v2.message;

const getIcon = (icons: Array<boolean|string>, index: number) => index >= 0 && index < icons.length ? icons[index] : false;

const ORIGIN = {
    vertical: "bottom",
    horizontal: "left",
} as PopoverOrigin;

interface StatusDel extends StatusType {
    hidden?: boolean;
    id?: string;
}

interface StatusListProps extends TaipyBaseProps, TaipyHoverProps {
    value: Array<[string, string] | StatusType> | [string, string] | StatusType;
    defaultValue?: string;
    withoutClose?: boolean;
    useIcon?: boolean | string;
}

const StatusList = (props: StatusListProps) => {
    const { value, defaultValue, withoutClose = false } = props;
    const [values, setValues] = useState<StatusDel[]>([]);
    const [opened, setOpened] = useState(false);
    const [multiple, setMultiple] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const className = useClassNames(props.libClassName, props.dynamicClassName, props.className);
    const hover = useDynamicProperty(props.hoverText, props.defaultHoverText, undefined);

    const icons = useMemo(() => {
        if (typeof props.useIcon === "string") {
            try {
                const iconsDict = JSON.parse(props.useIcon);
                const defaultVal = iconsDict.__default !== undefined ? iconsDict.__default : false;
                const res = [defaultVal, defaultVal, defaultVal, defaultVal];
                Object.entries(iconsDict).forEach(([k, v]) => {
                    const idx = getStatusIntValue(k);
                    if (idx >=0) {
                        res[idx] = v;
                    }
                });
                return res;
            } catch (e) {
                console.info(`Error parsing icons\n${(e as Error).message || e}`);
            }
            return [false, false, false, false];
        }
        return [!!props.useIcon, !!props.useIcon, !!props.useIcon, !!props.useIcon];

    }, [props.useIcon]);

    useEffect(() => {
        let val;
        if (value === undefined) {
            try {
                val = (defaultValue ? JSON.parse(defaultValue) : []) as StatusType[] | StatusType;
            } catch (e) {
                console.info(`Cannot parse status value: ${(e as Error).message || e}`);
                val = [] as StatusType[];
            }
        } else {
            val = value;
        }
        if (!Array.isArray(val) || (val.length && typeof val[0] !== "object")) {
            val = [val];
        }
        val = val.map((v) => {
            if (Array.isArray(v)) {
                return { status: v[0] || "", message: v[1] || "" };
            } else if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
                return { status: "" + v, message: "" + v };
            } else {
                return { status: v.status || "", message: v.message || "" };
            }
        });

        setValues(val as StatusDel[]);
        setMultiple(val.length > 1);
    }, [value, defaultValue]);

    const onClose = useCallback((val: StatusDel) => {
        setValues((values) => {
            const res = values.map((v) => {
                if (!v.hidden && statusEqual(v, val)) {
                    v.hidden = !v.hidden;
                }
                return v;
            });
            if (res.filter((v) => !v.hidden).length < 2) {
                setOpened(false);
                setMultiple(false);
            }
            return res;
        });
    }, []);

    const onOpen = useCallback((evt: MouseEvent) => {
        setOpened((op) => {
            setAnchorEl(op ? null : (evt.currentTarget || (evt.target as HTMLElement)).parentElement);
            return !op;
        });
    }, []);

    const globalProps = useMemo(
        () => (multiple ? { onClose: onOpen, openedIcon: opened ? <ArrowUpward /> : <ArrowDownward /> } : {}),
        [multiple, opened, onOpen]
    );

    const globStatus = getGlobalStatus(values);

    return (
        <Tooltip title={hover || ""}>
            <Box className={`${className} ${getComponentClassName(props.children)}`}>
                <Status
                    id={props.id}
                    value={globStatus}
                    className={getSuffixedClassNames(className, "-main")}
                    {...globalProps}
                    icon={getIcon(icons, getStatusIntValue(globStatus.status))}
                />
                <Popover open={opened} anchorEl={anchorEl} onClose={onOpen} anchorOrigin={ORIGIN}>
                    <Stack direction="column" spacing={1}>
                        {values
                            .filter((val) => !val.hidden)
                            .map((val, idx) => {
                                const closeProp = withoutClose ? {} : { onClose: () => onClose(val) };
                                return (
                                    <Status
                                        key={getId(props.id, idx)}
                                        id={getId(props.id, idx)}
                                        value={val}
                                        className={getSuffixedClassNames(className, `-${idx}`)}
                                        {...closeProp}
                                        icon={getIcon(icons, getStatusIntValue(val.status))}
                                    />
                                );
                            })}
                    </Stack>
                </Popover>
                {props.children}
            </Box>
        </Tooltip>
    );
};

export default StatusList;