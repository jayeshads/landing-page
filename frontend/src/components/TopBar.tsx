import React from "react";
import {
  ChevronDown,
  Circle,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const TopBar = () => {
  return (
    <header className="topbar" data-testid="topbar">
      <div className="topbar-left">
        <h1 className="page-title" data-testid="page-title">Campaigns</h1>
        <div className="account-switcher" data-testid="account-switcher">
          <div className="avatar-tile lavender">J</div>
          <ChevronDown size={14} />
          <span className="account-id">1710 (1675320010220461)</span>
          <ChevronDown size={14} />
        </div>
        <div className="opportunity" data-testid="opportunity-score">
          <span className="score-ring">100</span>
          <span>Opportunity score</span>
          <ChevronDown size={14} />
        </div>
      </div>
      <div className="topbar-right">
        <span className="updated-text">Updated just now</span>
        <Button className="icon-action" variant="outline" size="icon" data-testid="refresh-button" aria-label="Refresh">
          <RefreshCw size={17} />
        </Button>
        <Button className="discard-button" variant="outline" data-testid="discard-drafts-button">
          <Trash2 size={15} />
          Discard Drafts
        </Button>
        <Button className="publish-button" data-testid="review-publish-button">
          Review and publish (4)
        </Button>
        <Button className="icon-action" variant="outline" size="icon" data-testid="top-more-button" aria-label="More">
          <MoreHorizontal size={17} />
        </Button>
        <button className="profile-pill" data-testid="profile-menu" aria-label="Profile">
          <Circle size={28} fill="#dceeff" color="#aac9e9" />
          <ExternalLink size={12} className="profile-corner" />
        </button>
      </div>
    </header>
  );
};
