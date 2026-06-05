"""Self-evolving Skills (Phase 10 — the advanced one).

A "skill" is a reusable procedure the assistant writes for itself: a named set
of instructions (and optionally code) it can recall and apply later. Over time
the assistant refines its own skills, getting more capable.

Planned modules:
  - schema.py  : a Skill = name, description, trigger, instructions/steps.
  - author.py  : have the model draft a new skill from a successful task.
  - refine.py  : critique + improve an existing skill after using it.
  - registry.py: load/save skills in data/skills/ and surface matching ones.

Mental model: this is the same idea as Claude Code's own Skills — markdown
files with a description used to decide when to apply them.
"""
