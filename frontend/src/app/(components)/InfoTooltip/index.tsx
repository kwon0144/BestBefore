'use client';

import React, { ReactNode } from 'react';
import { Tooltip } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

export interface InfoTooltipProps {
  /**
   * Content items to display in the tooltip
   */
  contentItems: string[];
  
  /**
   * Custom header for the tooltip content
   */
  header?: string;
  
  /**
   * Custom footer text for the tooltip
   */
  footerText?: string;
  
  /**
   * Placement of the tooltip relative to the trigger
   */
  placement?: 'top' | 'right' | 'bottom' | 'left' | 'top-start' | 'top-end' | 'right-start' | 'right-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end';
  
  /**
   * Custom icon to use for the tooltip trigger
   */
  icon?: IconDefinition;
  
  /**
   * Additional class names for the tooltip button
   */
  buttonClassName?: string;
  
  /**
   * Additional class name for the tooltip content
   */
  contentClassName?: string;
  
  /**
   * Aria label for the tooltip button
   */
  ariaLabel?: string;
}

/**
 * A reusable tooltip component for displaying information with customizable content and styling
 */
const InfoTooltip: React.FC<InfoTooltipProps> = ({
  contentItems,
  header = "Information",
  footerText,
  placement = "top",
  icon = faCircleExclamation,
  buttonClassName = "",
  contentClassName = "",
  ariaLabel = "Information",
}) => {
  return (
    <Tooltip
      showArrow
      classNames={{
        base: [
          "before:bg-white before:border-b before:border-r before:border-green-200",
        ],
        content: [
          "py-4 px-5 shadow-lg",
          "text-darkgreen bg-white",
          "rounded-lg border border-green-200",
          "max-w-[280px] w-[280px]",
          contentClassName
        ],
      }}
      content={
        <div className="text-xs max-w-xs">
          <div className="flex items-center mb-3 pb-2 border-b border-green-200 text-sm">
            <FontAwesomeIcon icon={icon} className="text-green-600 mr-2" />
            <p className="font-semibold text-sm text-darkgreen">{header}</p>
          </div>
          <ul className="space-y-3">
            {contentItems.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2 font-bold text-sm">•</span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
          {footerText && (
            <div className="mt-3 pt-2 border-t border-green-200 text-[10px] text-green-700 italic">
              {footerText}
            </div>
          )}
        </div>
      }
      placement={placement}
    >
      <div
        className={`w-6 h-6 rounded-full bg-green-100 text-darkgreen flex items-center justify-center hover:bg-green-200 transition-colors cursor-help ${buttonClassName}`}
        role="button"
        aria-label={ariaLabel}
        tabIndex={-1}
      >
        <FontAwesomeIcon icon={icon} className="text-xl" />
      </div>
    </Tooltip>
  );
};

export default InfoTooltip; 