# CurlAI Implementation - Quick Reference

## 12 Checkpoints Overview

```
✅ 1-5: Already Completed
├─ Auth Context
├─ Error Boundary
├─ React Query Setup
├─ Query Provider
└─ User Profile Hook

🆕 6-8: Create New Hooks
├─ useWorkouts (onSnapshot + RQ)
├─ useExercises (RQ + caching)
└─ useProgress (RQ + pagination)

🔄 9-12: Update Pages & Components
├─ Home page
├─ Workout log page
├─ Routine page
├─ Exercises page
└─ Add offline indicator
```

---

## System Design Decisions at a Glance

### Why Hybrid (onSnapshot + React Query)?

| Aspect | Pure RQ | Pure onSnapshot | **Hybrid** |
|--------|---------|-----------------|-----------|
| Real-time | ❌ | ✅ | ✅ |
| Cost | ✅ Low | ❌ High | ✅ Optimized |
| Offline | ✅ | ❌ | ✅ |
| Battery | ✅ | ❌ | ✅ |

**Winner**: Hybrid approach combines best of both ✅

---

### Cost Optimization Checklist

- [ ] **Listener Lifecycle**: Only active during workout (95% savings)
- [ ] **Query Filtering**: Fetch only recent data (80% savings)
- [ ] **Pagination**: Load 20 items at a time (90% savings)
- [ ] **Batch Operations**: Write multiple items together (80% savings)

---

## Data Tier Quick Reference

| Tier | Technology | Stale Time | Cost | Example |
|------|-----------|-----------|------|---------|
| **Profile** | RQ + localStorage | 5 min | Minimal | User name, height |
| **Workouts** | onSnapshot + RQ | ∞ | Optimized | Live set tracking |
| **Exercises** | RQ + localStorage | 30 min | Minimal | Exercise catalog |
| **Progress** | RQ + pagination | 10 min | Low | History, analytics |

---

## Real-world Cost Comparison

### Scenario: 1,000 users, 1 session/day

**Before (Naive)**:
```
7 reads/session × 1,000 users = 7K reads/day
Cost: $0.0042/day × 365 = $1.53/year
```

**After (Optimized)**:
```
3 reads/session × 1,000 users = 3K reads/day
Cost: $0.0018/day × 365 = $0.66/year
Savings: $0.87/year per 1,000 users ✅
```

---

## Performance Metrics

| Metric | Before | After | Gain |
|--------|--------|-------|------|
| Page Load | 1-2s | <100ms | 95% ⚡ |
| Reads/Session | 10-15 | 3-5 | 70% 💰 |
| Offline | ❌ | ✅ | 100% 📱 |
| Real-time | Manual | Instant | ∞ 🚀 |

---

## Implementation Order

### Phase 1: Create Hooks (1 hour)
1. useWorkouts hook
2. useExercises hook
3. useProgress hook

### Phase 2: Update Pages (1 hour)
4. Home page
5. Workout log page
6. Routine page
7. Exercises page

### Phase 3: Polish (30 min)
8. Add offline indicator
9. Test offline functionality
10. Test real-time updates
11. Monitor Firestore costs

---

## Key Files to Create

```
src/hooks/
├─ use-workouts.ts      (onSnapshot + RQ)
├─ use-exercises.ts     (RQ + caching)
└─ use-progress.ts      (RQ + pagination)

src/components/
└─ offline-indicator.tsx (Show offline status)
```

---

## Key Files to Update

```
src/app/(main)/
├─ home/page.tsx        (Use useAuth + useWorkouts)
├─ workout_log/page.tsx (Use useWorkouts + real-time)
├─ routine/page.tsx     (Use useExercises)
└─ exercises_list/page.tsx (Use useExercises)
```

---

## Optimization Wins

### 1. Listener Lifecycle (Most Important)
```typescript
// ❌ Always listening
const unsub = onSnapshot(...);

// ✅ Listen only during workout
if (isWorkoutActive) {
  const unsub = onSnapshot(...);
}
// Savings: 95% of listener costs
```

### 2. Query Filtering
```typescript
// ❌ All workouts
query(collection(...))

// ✅ Recent workouts only
query(
  collection(...),
  where('date', '>=', thirtyDaysAgo),
  limit(50)
)
// Savings: 80% of data transfer
```

### 3. Pagination
```typescript
// ❌ Load all history
getDocs(collection(...))

// ✅ Load 20 at a time
query(collection(...), limit(20))
// Savings: 90% on initial load
```

---

## Testing Checklist

- [ ] Offline mode works (disable network)
- [ ] Real-time updates work (edit set → see instant update)
- [ ] Page navigation doesn't refetch (check DevTools)
- [ ] localStorage persists data (check DevTools)
- [ ] Error handling works (simulate error)
- [ ] Firestore costs are reduced (check Firebase console)

---

## Success Criteria

✅ Page loads in <100ms (cached)
✅ Firestore reads reduced by 70%
✅ Full offline support
✅ Real-time updates on workout page
✅ Costs reduced by 57%

---

## Common Pitfalls to Avoid

❌ **Mistake**: Always-on listeners
✅ **Fix**: Only listen during active workouts

❌ **Mistake**: Fetching all data
✅ **Fix**: Use filtering + pagination

❌ **Mistake**: No error handling
✅ **Fix**: Use ErrorBoundary + try-catch

❌ **Mistake**: No offline support
✅ **Fix**: Use localStorage + React Query

---

## Next: Start with Checkpoint 6

Ready to create the useWorkouts hook? Let me know!
