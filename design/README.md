# Maquettes de référence

Exportées du canvas Claude Design « Outrance — Refonte du site » : https://claude.ai/artifact/LyHbwCZW9Mi6soZAXcKMwT

| Écran | Desktop 1440 | Tablette 834 | Mobile 390 |
| --- | --- | --- | --- |
| Accueil animé | `Main.dc.html` | `Accueil-tablette.dc.html` | `Accueil-mobile.dc.html` |
| Agenda | `Agenda.dc.html` | `Agenda-tablette.dc.html` | `Agenda-mobile.dc.html` |
| Fiche événement | `Evenement.dc.html` | `Evenement-tablette.dc.html` | `Evenement-mobile.dc.html` |
| Artistes (+ fiche en panneau) | `Artistes.dc.html` | `Artistes-tablette.dc.html` | `Artistes-mobile.dc.html` |
| Galerie (+ visionneuses) | `Galerie.dc.html` | `Galerie-tablette.dc.html` | `Galerie-mobile.dc.html` |
| L’association | `Association.dc.html` | `Association-tablette.dc.html` | `Association-mobile.dc.html` |
| Presse / Pro | `Presse-pro.dc.html` (fluide) | — | — |
| Mentions légales | `Mentions-legales.dc.html` (fluide) | — | — |
| 404 | `Page-404.dc.html` (fluide) | — | — |
| Composants et états | `Composants.dc.html` | — | — |

Comment les lire :

- Le balisage est dans `<x-dc>` ; les styles de base, les classes (`.btn`, `.card`, `.lbl`…) et les keyframes sont dans `<helmet><style>`.
- Les `{{…}}` sont des valeurs calculées dans le bloc `<script type="text/x-dc">` en bas de fichier, et `<sc-for>` / `<sc-if>` sont des boucles et des conditions. Les interactions (panneaux, visionneuses, menus, filtres, scroll, souris) y sont codées : reprends leurs états, seuils et durées.
- Les trois artboards d’accueil sont des prototypes en fenêtre avec un scroller interne : dans le site, le scroll est celui de la page.
- Le logo est référencé en `/assets/logo/outrance-logo-white.png`.
- Les maquettes desktop des pages intérieures sont fluides ; les maquettes tablette et mobile sont à largeur fixe. Le site final doit être fluide entre ces trois points.

`../explorations/` contient les pistes non retenues, pour contexte seulement.
