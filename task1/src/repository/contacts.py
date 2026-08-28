from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, timedelta
from src.entity.models import Contact, User
from src.schemas.contact import ContactSchema, ContactUpdateSchema


async def get_contacts(limit: int, offset: int, query: str | None,
                       db: AsyncSession, user: User):
    stmt = select(Contact).filter_by(user=user)

    if query:
        stmt = stmt.where(
            Contact.name.ilike(f"%{query}%") |
            Contact.surname.ilike(f"%{query}%") |
            Contact.email.ilike(f"%{query}%")
        )

    stmt = stmt.offset(offset).limit(limit)

    contacts = await db.execute(stmt)

    return contacts.scalars().all()


async def get_birthdays(db: AsyncSession, user: User):
    today = date.today()

    stmt = select(Contact).filter_by(user=user)
    result = await db.execute(stmt)
    contacts = result.scalars().all()

    birthdays = []

    for contact in contacts:
        for i in range(7):
            current_date = today + timedelta(days=i)

            if (
                contact.birthday.month == current_date.month
                and contact.birthday.day == current_date.day
            ):
                birthdays.append(contact)
                break

    return birthdays


async def get_contact(contact_id: int, db: AsyncSession, user: User):
    stmt = select(Contact).filter_by(id=contact_id, user=user)
    contact = await db.execute(stmt)
    return contact.scalar_one_or_none()


async def create_contact(body: ContactSchema, db: AsyncSession, user: User):
    contact = Contact(**body.model_dump(exclude_unset=True), user=user)
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return contact


async def update_contact(contact_id: int, body: ContactUpdateSchema, db: AsyncSession, user: User):
    stmt = select(Contact).filter_by(id=contact_id, user=user)
    result = await db.execute(stmt)
    contact = result.scalar_one_or_none()
    if contact:
        contact.name = body.name
        contact.surname = body.surname
        contact.email = body.email
        contact.phone = body.phone
        contact.birthday = body.birthday
        contact.info = body.info
        # contact.completed = body.completed
        await db.commit()
        await db.refresh(contact)
    return contact


async def delete_contact(contact_id: int, db: AsyncSession, user: User):
    stmt = select(Contact).filter_by(id=contact_id, user=user)
    contact = await db.execute(stmt)
    contact = contact.scalar_one_or_none()
    if contact:
        await db.delete(contact)
        await db.commit()
    return contact
