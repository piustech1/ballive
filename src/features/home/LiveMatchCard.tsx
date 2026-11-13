import React from 'react';
import { LiveMatch } from '../../constants/mockData';
import { UniversalMatchCard } from '../../components/common/UniversalMatchCard';

interface LiveMatchCardProps {
  match: LiveMatch;
  onPress?: () => void;
}

export const LiveMatchCard: React.FC<LiveMatchCardProps> = ({ match, onPress }) => {
  return (
    <UniversalMatchCard
      match={match}
      layout="carousel"
      onPress={onPress}
    />
  );
};

export default LiveMatchCard;
