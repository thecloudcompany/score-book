# ScoreBook - Project Overview

## What is ScoreBook?

ScoreBook is a mobile-first tournament management application designed for casual racket sports players. It enables friends and groups to organize, track, and manage round-robin and knockout tournaments for badminton and tennis, with plans to expand to other sports.

## The Problem

Casual sports players face several challenges when organizing tournaments:

1. **Manual Score Tracking**: Players resort to pen and paper, spreadsheets, or mental math to track scores across multiple matches, leading to errors and disputes.

2. **Complex Standings Calculations**: In round-robin tournaments, calculating standings requires tracking wins, losses, point differentials, and applying tiebreakers—tedious and error-prone when done manually.

3. **No Centralized Record**: Tournament results are often lost after the event, with no easy way to review past performances or track improvement over time.

4. **Dependency on Internet**: Many existing tournament apps require internet connectivity, making them unusable in gyms, parks, or venues with poor reception.

5. **Overly Complex Tools**: Professional tournament management software is overkill for casual play, with steep learning curves and unnecessary features.

## Target Users

- **Casual badminton/tennis players** who organize friendly tournaments with friends, family, or colleagues
- **Recreational sports groups** looking for a simple way to track their regular play sessions
- **Amateur tournament organizers** who need basic bracket management without the complexity of professional tools

## Core Value Proposition

ScoreBook provides a **simple, offline-first tournament management experience** that:

- **Eliminates manual calculations**: Automatically computes standings, tiebreakers, and match progression
- **Works anywhere**: Fully offline operation with local data storage
- **Reduces friction**: Quick tournament setup with minimal configuration
- **Preserves history**: Maintains a complete record of all tournaments and results
- **Scales with the group**: Handles 2-16 players comfortably for casual play

## Vision

To become the go-to tournament management tool for casual sports players by:

1. **Prioritizing simplicity over features**: Every feature must justify its complexity
2. **Maintaining offline-first architecture**: No feature should require internet connectivity
3. **Supporting multiple sports**: Start with badminton and tennis, expand to other racket sports and beyond
4. **Enabling social sharing**: Easy export of standings and results for sharing with participants
5. **Growing organically**: Add features based on real user needs, not speculative requirements

## What Makes ScoreBook Different

### Local-First Architecture
Unlike cloud-based tournament apps, ScoreBook stores all data locally on the device. This ensures:
- **Privacy**: No personal data leaves the device
- **Reliability**: Works in any environment, regardless of connectivity
- **Speed**: Instant response times with no network latency
- **Ownership**: Users control their data completely

### Sport-Agnostic Design
The application is built with a modular sport system that separates:
- **Scoring rules** (how points are awarded)
- **Match structure** (games, sets, etc.)
- **Tournament formats** (round-robin, knockout, etc.)

This allows easy addition of new sports without rewriting core logic.

### Casual-First UX
Professional tournament software assumes organizers have training. ScoreBook assumes:
- Users want to start playing in under 2 minutes
- Tournament setup should require minimal decisions
- The app should guide users through the process
- Errors should be preventable, not just correctable

## Goals

### Short-term (v1)
- [x] Round-robin tournaments for badminton and tennis
- [x] Automatic standings calculation with tiebreakers
- [x] Match score entry and editing
- [x] Knockout tournaments (single elimination)
- [x] Share standings as images

### Medium-term (v2)
- [ ] Additional sports (table tennis, squash, pickleball)
- [ ] Double elimination tournaments
- [ ] Player profiles and statistics
- [ ] Tournament history and replay

### Long-term (v3+)
- [ ] Multi-device sync (optional, user-controlled)
- [ ] League management (recurring tournaments)
- [ ] Advanced statistics and analytics
- [ ] Integration with scoring hardware (optional)

## Success Metrics

- **Time to first match**: < 2 minutes from app launch to first score entry
- **Tournament completion rate**: > 90% of started tournaments are completed
- **User retention**: > 50% of users create a second tournament within 30 days
- **Error rate**: < 5% of tournaments require score corrections
- **Offline usage**: > 95% of sessions occur without internet connectivity
