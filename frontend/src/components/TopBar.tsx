import React from "react";
import {
  BarChart3,
  ChevronDown,
  Circle,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const TopBar = () => {
  return (
    <header className="topbar" data-testid="topbar">
      <div className="topbar-left">
        <h1 className="page-title" data-testid="page-title">Campaigns</h1>
        <div className="account-switcher" data-testid="account-switcher">
          <div className="avatar-tile yellow">A</div>
          <span className="account-icon"><BarChart3 size={13} /></span>
          <span className="account-id">1st (246100831747802)</span>
          <ChevronDown size={15} />
        </div>
        <div className="opportunity" data-testid="opportunity-score">
          <span className="score-ring">88</span>
          <span>Opportunity score</span>
          <ChevronDown size={14} />
        </div>
      </div>
      <div className="topbar-right">
        <span className="updated-text">Updated just now</span>
        <Button className="icon-action" variant="outline" size="icon" data-testid="refresh-button" aria-label="Refresh">
          <RefreshCw size={18} />
        </Button>
        <Button className="review-muted-button" variant="outline" data-testid="review-publish-button">
          Review and publish
        </Button>
        <Button className="icon-action" variant="outline" size="icon" data-testid="top-more-button" aria-label="More">
          <MoreHorizontal size={18} />
        </Button>
        <button className="profile-pill" data-testid="profile-menu" aria-label="Profile">
          <Circle size={29} fill="#d7dbe1" color="#c9d0d7" />
          <span className="fb-mini">f</span>
        </button>
      </div>
    </header>
  );
};
