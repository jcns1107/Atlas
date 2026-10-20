"""Self-evolving Skills (Phase 10 — the advanced one).

A "skill" is a reusable procedure the assistant writes for itself: a named set
of instructions (and optionally scripts) it can recall and apply later. Over
time the assistant refines its own skills, getting more capable.

Use the open **Agent Skills** format (agentskills.io) — the same one Claude
Code and many other agents read — so your skills are portable:

    data/skills/<skill-name>/
        SKILL.md       <- required: YAML frontmatter (`name`, `description`)
                          followed by markdown instructions
        scripts/       <- optional helper code
        references/    <- optional longer docs the skill can point to

Progressive disclosure is the trick that makes this scale: put only each
skill's name + description in the prompt (a few dozen tokens each), and give
the model a `load_skill(name)` tool that reads the full SKILL.md when it
decides a skill fits. No embeddings needed to match a task to a skill — the
model reads the descriptions itself.

Planned modules:
  - registry.py: scan data/skills/, parse frontmatter, build the skills index.
  - author.py  : have the model draft a new SKILL.md from a successful task.
  - refine.py  : critique + improve an existing skill after using it.
Keep a human in the loop: new or changed skills wait for your OK.
"""
