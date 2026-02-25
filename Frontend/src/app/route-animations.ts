import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        width: '100%',
        opacity: 0,
      })
    ], { optional: true }),

    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(20px)'
      })
    ], { optional: true }),

    group([
      query(':leave', [
        animate('200ms ease-out', style({
          opacity: 0,
          transform: 'translateY(-20px)'
        }))
      ], { optional: true }),

      query(':enter', [
        animate('300ms 100ms ease-out', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ], { optional: true })
    ])
  ])
]);
